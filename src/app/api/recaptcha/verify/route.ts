import { NextRequest, NextResponse } from "next/server";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // If no secret key configured, allow (dev mode)
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn("[reCAPTCHA Verify] No secret key configured, allowing request (dev mode)");
    return NextResponse.json({ success: true, devMode: true });
  }

  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing token" },
        { status: 400 }
      );
    }

    // Verify token with Google
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`;
    const response = await fetch(verificationUrl, { method: "POST" });
    const data = await response.json();

    if (!data.success) {
      console.error("[reCAPTCHA Verify] Failed:", data["error-codes"]);
      return NextResponse.json(
        { success: false, error: "reCAPTCHA verification failed", details: data["error-codes"] },
        { status: 400 }
      );
    }

    // Check score threshold (v3 returns score 0.0-1.0)
    if (data.score !== undefined && data.score < 0.5) {
      console.warn(`[reCAPTCHA Verify] Low score: ${data.score}`);
      return NextResponse.json(
        { success: false, error: "Low reCAPTCHA score", score: data.score },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: data.score,
      action: data.action,
    });
  } catch (error) {
    console.error("[reCAPTCHA Verify] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
