import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export const maxDuration = 60;

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Pool de modelos gratuitos para fallback
const freeModels = [
  "meta-llama/llama-3.1-8b-instruct",
  "mistralai/mistral-7b-instruct",
  "qwen/qwen-2.5-7b-instruct",
  "google/gemma-2-9b-it",
];

interface GenerateRequest {
  type: "blog" | "newsletter" | "social";
  topic: string;
  language: "en" | "es" | "both";
}

function buildPrompt(type: string, topic: string, language: string): string {
  const languageInstruction =
    language === "both"
      ? "Generate both English and Spanish versions. Return a JSON object with 'en' and 'es' keys, each containing the full content."
      : `Generate the content in ${language === "en" ? "English" : "Spanish"}.`;

  let typeInstruction = "";
  if (type === "blog") {
    typeInstruction =
      "For blog posts: include title, excerpt, and 3-4 paragraphs of content. Return JSON with fields: title, excerpt, content (array of paragraphs).";
  } else if (type === "newsletter") {
    typeInstruction =
      "For newsletters: include subject line and body with HTML formatting. Return JSON with fields: subject, body (HTML string).";
  } else if (type === "social") {
    typeInstruction =
      "For social media: include 3 variations with hashtags. Return JSON with fields: variations (array of objects with 'text' and 'hashtags' fields).";
  }

  return `You are a professional content writer and SEO specialist for Viva Resource Foundation, a nonprofit serving the immigrant community in Colorado, USA.

Generate content based on the following:
- Type: ${type}
- Topic: ${topic}
- Language: ${language}

Requirements:
- Professional, warm, and empathetic tone
- Focus on community impact and empowerment
- Include geolocalized keywords for Colorado, Denver, Peyton naturally in the content
- ${languageInstruction}
- ${typeInstruction}

IMPORTANT: Also generate SEO metadata for this content. Include the following additional fields in your JSON response:
- "seoMetaTitle": A compelling meta title (max 60 characters) optimized for search engines with Colorado keywords
- "seoMetaDescription": A compelling meta description (max 160 characters) with call-to-action and Colorado keywords
- "seoKeywords": An array of 5-8 relevant keywords including geolocalized terms like "Colorado", "Denver", "Peyton"
- "seoSlug": A URL-friendly slug using kebab-case (e.g., "immigrant-resources-denver-colorado")
- "imageAltText": Suggested alt text for the featured image (descriptive, with relevant keywords)

Return the content in JSON format with all fields. Do not include any markdown or extra text, just the raw JSON.`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleGenerate(request);
}

async function handleGenerate(request: NextRequest): Promise<NextResponse> {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured" },
      { status: 500 }
    );
  }

  // Rate limiting: 3 requests per 15 minutes per IP
  const ip = getClientIp(request);
  const rateCheck = checkRateLimit(ip, RATE_LIMITS.ai);
  if (rateCheck.limited) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${rateCheck.retryAfter} segundos.` },
      { status: 429 }
    );
  }

  try {
    const body: GenerateRequest = await request.json();

    // Validate input
    if (!body.type || !body.topic || !body.language) {
      return NextResponse.json(
        { error: "Missing required fields: type, topic, language" },
        { status: 400 }
      );
    }

    if (!["blog", "newsletter", "social"].includes(body.type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'blog', 'newsletter', or 'social'" },
        { status: 400 }
      );
    }

    if (!["en", "es", "both"].includes(body.language)) {
      return NextResponse.json(
        { error: "Invalid language. Must be 'en', 'es', or 'both'" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(body.type, body.topic, body.language);

    // Intentar con cada modelo del pool hasta encontrar uno que funcione
    let response: Response | null = null;
    let lastError: string | null = null;

    for (const model of freeModels) {
      response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Viva Resource AI Generator",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      // Si la respuesta es exitosa, salir del loop
      if (response.ok) {
        break;
      }

      // Si es error de rate limit o servicio no disponible, intentar siguiente modelo
      if (response.status === 429 || response.status === 503) {
        lastError = `Model ${model} rate limited or unavailable, trying next...`;
        continue;
      }

      // Para otros errores, retornar el error directamente
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.error?.message || "Error generating content",
          details: errorData,
          model,
        },
        { status: response.status }
      );
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: "All free models are currently unavailable. Please try again later.", details: lastError },
        { status: 503 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      );
    }

    // Try to parse JSON from the response
    try {
      // Remove markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      
      const parsedContent = JSON.parse(jsonStr);
      return NextResponse.json({
        success: true,
        content: parsedContent,
        usage: data.usage || null,
      });
    } catch {
      // If JSON parsing fails, return raw content
      return NextResponse.json({
        success: true,
        content: { raw: content },
        usage: data.usage || null,
      });
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to generate content", details: errorMessage },
      { status: 500 }
    );
  }
}
