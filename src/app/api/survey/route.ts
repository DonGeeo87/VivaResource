import { NextRequest, NextResponse } from "next/server";
import { getTransporter, getAdminEmails, FROM_NAME, FROM_EMAIL } from "@/lib/email/nodemailer";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

const LABEL_MAP: Record<string, { en: string; es: string }> = {
  job_training: { en: "Job Training & Employment", es: "Capacitación Laboral y Empleo" },
  health_wellness: { en: "Health & Wellness Workshops", es: "Talleres de Salud y Bienestar" },
  education: { en: "Educational Programs (GED, College Prep)", es: "Programas Educativos" },
  immigration: { en: "Immigration Legal Help", es: "Ayuda Legal de Inmigración" },
  financial: { en: "Financial Literacy & Savings", es: "Educación Financiera" },
  housing: { en: "Housing & Rental Assistance", es: "Asistencia de Vivienda" },
  food: { en: "Food Distribution & Nutrition", es: "Distribución de Alimentos" },
  childcare: { en: "Childcare & Youth Programs", es: "Programas para Niños" },
  language: { en: "English Classes (ESL)", es: "Clases de Inglés" },
  digital: { en: "Digital Skills & Technology", es: "Habilidades Digitales" },
  no_time: { en: "No time / Schedule conflict", es: "No tengo tiempo / Conflictos" },
  location: { en: "Location too far", es: "Ubicación muy lejos" },
  health: { en: "Health issues / Disability", es: "Problemas de salud / Discapacidad" },
  transport: { en: "No transportation", es: "No tengo transporte" },
  language_barrier: { en: "Language barrier", es: "Barrera del idioma" },
  no_childcare: { en: "No childcare available", es: "No hay cuidado de niños" },
  cost: { en: "Cost too high", es: "Costo muy alto" },
  unaware: { en: "Didn't know about event", es: "No sabía del evento" },
  not_interested: { en: "Topics not interesting", es: "Temas no me interesan" },
  email: { en: "Email", es: "Correo Electrónico" },
  whatsapp: { en: "WhatsApp / Text", es: "WhatsApp / Mensaje de Texto" },
  facebook: { en: "Facebook", es: "Facebook" },
  instagram: { en: "Instagram", es: "Instagram" },
  website: { en: "Website", es: "Sitio Web" },
  flyers: { en: "Flyers / Posters", es: "Volantes / Carteles" },
  word_of_mouth: { en: "Word of mouth / Friends", es: "Boca a Boca / Amistades" },
  mornings: { en: "Mornings (9AM-12PM)", es: "Mañanas (9AM-12PM)" },
  afternoons: { en: "Afternoons (12PM-5PM)", es: "Tardes (12PM-5PM)" },
  evenings: { en: "Evenings (5PM-8PM)", es: "Noches (5PM-8PM)" },
  weekends: { en: "Weekends", es: "Fines de Semana" },
  flexible: { en: "Flexible / No preference", es: "Flexible / Sin preferencia" },
  yes: { en: "Yes, would need childcare", es: "Sí, necesitaría cuidado de niños" },
  no: { en: "No, don't need childcare", es: "No, no necesito cuidado" },
  maybe: { en: "Maybe, depends on event", es: "Tal vez, depende del evento" },
};

function label(value: string, lang: string): string {
  return LABEL_MAP[value]?.[lang === "es" ? "es" : "en"] || value;
}

function buildList(arr: string[], lang: string): string {
  return arr.map((v) => `<li>${label(v, lang)}</li>`).join("");
}

async function sendSurveyNotification(body: Record<string, unknown>): Promise<void> {
  const lang = (body.language as string) || "en";
  const isES = lang === "es";
  const t = (en: string, es: string) => (isES ? es : en);

  const interests = Array.isArray(body.interests) ? (body.interests as string[]) : [];
  const barriers = Array.isArray(body.barriers) ? (body.barriers as string[]) : [];
  const channels = Array.isArray(body.channels) ? (body.channels as string[]) : [];
  const wantsContact = body.wants_contact === true || body.wants_contact === "true";
  const contactValue = body.contact_value || "";
  const contactMethod = body.contact_method || "";

  const html = `
    <h2 style="color:#025689;margin:0 0 16px 0;">${t("New Survey Response", "Nueva Respuesta de Encuesta")}</h2>
    <p style="color:#666;font-size:13px;margin:0 0 20px 0;">
      ${t("Submitted on", "Enviado el")} ${new Date().toLocaleString(isES ? "es-CL" : "en-US")}
      ${isES ? "" : ` · Language: ${lang.toUpperCase()}`}
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${interests.length > 0 ? `
        <tr><td style="padding:10px 14px;background:#eef2ff;font-weight:600;color:#4338ca;font-size:14px;" colspan="2">
          ${t("Interests", "Intereses")} (${interests.length})
        </td></tr>
        <tr><td style="padding:6px 14px 14px;font-size:13px;color:#333;" colspan="2">
          <ul style="margin:0;padding-left:20px;">${buildList(interests, lang)}</ul>
        </td></tr>
        ${body.interests_other ? `<tr><td style="padding:0 14px 10px;font-size:13px;color:#666;" colspan="2"><em>${t("Other:", "Otro:")}</em> ${body.interests_other}</td></tr>` : ""}
      ` : ""}
      ${barriers.length > 0 ? `
        <tr><td style="padding:10px 14px;background:#fffbeb;font-weight:600;color:#b45309;font-size:14px;" colspan="2">
          ${t("Barriers", "Barreras")} (${barriers.length})
        </td></tr>
        <tr><td style="padding:6px 14px 14px;font-size:13px;color:#333;" colspan="2">
          <ul style="margin:0;padding-left:20px;">${buildList(barriers, lang)}</ul>
        </td></tr>
        ${body.barriers_other ? `<tr><td style="padding:0 14px 10px;font-size:13px;color:#666;" colspan="2"><em>${t("Other:", "Otro:")}</em> ${body.barriers_other}</td></tr>` : ""}
      ` : ""}
      ${channels.length > 0 ? `
        <tr><td style="padding:10px 14px;background:#f5f3ff;font-weight:600;color:#7c3aed;font-size:14px;" colspan="2">
          ${t("Preferred Channels", "Canales Preferidos")} (${channels.length})
        </td></tr>
        <tr><td style="padding:6px 14px 14px;font-size:13px;color:#333;" colspan="2">
          <ul style="margin:0;padding-left:20px;">${buildList(channels, lang)}</ul>
        </td></tr>
      ` : ""}
      ${body.preferred_time ? `
        <tr><td style="padding:10px 14px;background:#ecfdf5;font-weight:600;color:#047857;font-size:14px;" colspan="2">
          ${t("Preferred Time", "Horario Preferido")}
        </td></tr>
        <tr><td style="padding:6px 14px 14px;font-size:13px;color:#333;" colspan="2">
          • ${label(body.preferred_time as string, lang)}
        </td></tr>
      ` : ""}
      ${body.needs_childcare ? `
        <tr><td style="padding:10px 14px;background:#fff1f2;font-weight:600;color:#be123c;font-size:14px;" colspan="2">
          ${t("Childcare", "Cuidado de Niños")}
        </td></tr>
        <tr><td style="padding:6px 14px 14px;font-size:13px;color:#333;" colspan="2">
          • ${label(body.needs_childcare as string, lang)}
        </td></tr>
      ` : ""}
      ${wantsContact ? `
        <tr><td style="padding:10px 14px;background:#f0f9ff;font-weight:600;color:#0369a1;font-size:14px;" colspan="2">
          ${t("📞 Wants Contact", "📞 Quiere ser Contactado")}
        </td></tr>
        <tr><td style="padding:6px 14px 14px;font-size:13px;color:#333;" colspan="2">
          • ${t("Method:", "Método:")} ${contactMethod || "-"}<br>
          • ${t("Contact:", "Contacto:")} <strong>${contactValue || "-"}</strong>
        </td></tr>
      ` : ""}
      ${body.comments ? `
        <tr><td style="padding:10px 14px;background:#f1f5f9;font-weight:600;color:#475569;font-size:14px;" colspan="2">
          ${t("Comments", "Comentarios")}
        </td></tr>
        <tr><td style="padding:6px 14px 14px;font-size:13px;color:#333;font-style:italic;" colspan="2">
          ${body.comments}
        </td></tr>
      ` : ""}
    </table>
    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
    <p style="color:#999;font-size:12px;margin:0;">
      ${t("View all responses in the admin panel.", "Ver todas las respuestas en el panel de administración.")}
    </p>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: getAdminEmails(),
    subject: `[Viva Resource] ${t("New Survey Response", "Nueva Respuesta de Encuesta")}`,
    html,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const db = await adminDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const doc = {
      interests: body.interests || [],
      interests_other: body.interests_other || "",
      barriers: body.barriers || [],
      barriers_other: body.barriers_other || "",
      channels: body.channels || [],
      preferred_time: body.preferred_time || "",
      needs_childcare: body.needs_childcare || "",
      contact_method: body.contact_method || "",
      contact_value: body.contact_value || "",
      wants_contact: body.wants_contact || false,
      comments: body.comments || "",
      submittedAt: new Date(),
      language: body.language || "en",
    };

    const ref = await db.collection("survey_responses").add(doc);

    // Send notification email (fire-and-forget — don't block response)
    sendSurveyNotification(body).catch((err) =>
      console.error("[Survey Notify] Error sending email:", err)
    );

    return NextResponse.json(
      { success: true, id: ref.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Survey API] Error:", error);
    return NextResponse.json(
      { error: "Error al guardar la encuesta" },
      { status: 500 }
    );
  }
}