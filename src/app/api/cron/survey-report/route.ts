import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/admin-db";
import { getTransporter, getAdminEmails, FROM_NAME, FROM_EMAIL } from "@/lib/email/nodemailer";

export const dynamic = "force-dynamic";

const LABEL_MAP: Record<string, { en: string; es: string }> = {
  job_training: { en: "Job Training & Employment", es: "Capacitación Laboral" },
  health_wellness: { en: "Health & Wellness", es: "Salud y Bienestar" },
  education: { en: "Educational Programs", es: "Programas Educativos" },
  immigration: { en: "Immigration Legal Help", es: "Ayuda Legal" },
  financial: { en: "Financial Literacy", es: "Educación Financiera" },
  housing: { en: "Housing Assistance", es: "Asistencia de Vivienda" },
  food: { en: "Food Distribution", es: "Distribución de Alimentos" },
  language: { en: "English Classes (ESL)", es: "Clases de Inglés" },
  digital: { en: "Digital Skills", es: "Habilidades Digitales" },
  no_time: { en: "No time", es: "Sin tiempo" },
  location: { en: "Location too far", es: "Ubicación lejos" },
  health: { en: "Health issues", es: "Problemas de salud" },
  transport: { en: "No transportation", es: "Sin transporte" },
  language_barrier: { en: "Language barrier", es: "Barrera idioma" },
  no_childcare: { en: "No childcare", es: "Sin cuidado niños" },
  cost: { en: "Cost too high", es: "Costo alto" },
  unaware: { en: "Didn't know", es: "No sabía" },
  not_interested: { en: "Not interested", es: "No interesa" },
  mornings: { en: "Mornings", es: "Mañanas" },
  afternoons: { en: "Afternoons", es: "Tardes" },
  evenings: { en: "Evenings", es: "Noches" },
  weekends: { en: "Weekends", es: "Findes" },
  flexible: { en: "Flexible", es: "Flexible" },
  yes: { en: "Yes", es: "Sí" },
  no: { en: "No", es: "No" },
  maybe: { en: "Maybe", es: "Tal vez" },
  email: { en: "Email", es: "Email" },
  whatsapp: { en: "WhatsApp", es: "WhatsApp" },
  facebook: { en: "Facebook", es: "Facebook" },
  instagram: { en: "Instagram", es: "Instagram" },
  website: { en: "Website", es: "Sitio Web" },
  flyers: { en: "Flyers", es: "Volantes" },
  word_of_mouth: { en: "Word of mouth", es: "Boca a boca" },
};

function label(value: string): string {
  return LABEL_MAP[value]?.en || value;
}

function countOccurrences(items: string[]): [string, number][] {
  const map = new Map<string, number>();
  items.forEach((v) => map.set(v, (map.get(v) || 0) + 1));
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function buildBar(items: [string, number][], total: number): string {
  if (total === 0) return "";
  return items
    .map(([key, count]) => {
      const pct = Math.round((count / total) * 100);
      const barW = Math.max(pct * 3, 10);
      return `
        <tr>
          <td style="padding: 4px 8px; font-size: 12px; color: #333; white-space: nowrap;">${label(key)}</td>
          <td style="padding: 4px 8px; font-size: 12px; color: #555; text-align: right; width: 40px;">${count}</td>
          <td style="padding: 4px 8px;">
            <div style="height: 16px; width: ${barW}px; background: linear-gradient(90deg, #025689, #00a3e0); border-radius: 8px;"></div>
          </td>
        </tr>`;
    })
    .join("");
}

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  if (typeof value === "number") return new Date(value);
  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const secret = request.headers.get("X-Report-Secret");
    if (!secret || secret !== process.env.REPORT_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await adminDb();
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Last 7 days
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    // Query survey responses
    const surveySnap = await db
      .collection("survey_responses")
      .where("submittedAt", ">=", since)
      .get();

    const total = surveySnap.size;
    const allInterests: string[] = [];
    const allBarriers: string[] = [];
    const allChannels: string[] = [];
    const allTimes: string[] = [];
    const allChildcare: string[] = [];
    let contactCount = 0;

    const latestResponses = surveySnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown>))
      .sort((a, b) => {
        const da = parseDateValue(a.submittedAt)?.getTime() || 0;
        const db_ = parseDateValue(b.submittedAt)?.getTime() || 0;
        return db_ - da;
      })
      .slice(0, 10);

    for (const doc of surveySnap.docs) {
      const d = doc.data();
      if (Array.isArray(d.interests)) allInterests.push(...d.interests);
      if (Array.isArray(d.barriers)) allBarriers.push(...d.barriers);
      if (Array.isArray(d.channels)) allChannels.push(...d.channels);
      if (d.preferred_time) allTimes.push(d.preferred_time);
      if (d.needs_childcare) allChildcare.push(d.needs_childcare);
      if (d.wants_contact) contactCount++;
    }

    const topInterests = countOccurrences(allInterests);
    const topBarriers = countOccurrences(allBarriers);
    const topChannels = countOccurrences(allChannels);
    const timesCount = countOccurrences(allTimes);
    const childcareCount = countOccurrences(allChildcare);

    const latestRows = latestResponses
      .map((r) => {
        const date = parseDateValue(r.submittedAt);
        const lang = (r.language as string) || "en";
        const interests = Array.isArray(r.interests) ? (r.interests as string[]).map(label).join(", ") : "-";
        const contact = r.wants_contact ? `📞 ${r.contact_value || "-"}` : "✗";
        return `
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #e0e0e0; font-size: 12px;">${date?.toLocaleDateString() || "-"}</td>
            <td style="padding: 6px 10px; border: 1px solid #e0e0e0; font-size: 12px;">${lang.toUpperCase()}</td>
            <td style="padding: 6px 10px; border: 1px solid #e0e0e0; font-size: 12px;">${interests.substring(0, 60)}</td>
            <td style="padding: 6px 10px; border: 1px solid #e0e0e0; font-size: 12px;">${contact}</td>
          </tr>`;
      })
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:'Public Sans',Arial,sans-serif;background-color:#f9f9f9;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;padding:40px 0;">
          <tr><td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <tr><td style="background-color:#025689;padding:24px 32px;text-align:center;">
                <span style="font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:24px;font-weight:800;color:#ffffff;">VIVA RESOURCE</span>
                <p style="color:#b7f569;font-size:14px;margin:8px 0 0 0;">Weekly Survey Report</p>
              </td></tr>
              <tr><td style="padding:32px;">
                <h2 style="color:#025689;font-size:22px;margin:0 0 4px 0;">Community Voice Weekly Report</h2>
                <p style="color:#666;font-size:13px;margin:0 0 24px 0;">
                  ${since.toLocaleDateString()} – ${now.toLocaleDateString()}
                </p>

                <!-- KPI Cards -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td width="33%" style="padding:4px;">
                      <div style="background:#eef2ff;border-radius:12px;padding:16px;text-align:center;">
                        <div style="font-size:28px;font-weight:800;color:#4338ca;">${total}</div>
                        <div style="font-size:12px;color:#6366f1;">Total Responses</div>
                      </div>
                    </td>
                    <td width="33%" style="padding:4px;">
                      <div style="background:#f0f9ff;border-radius:12px;padding:16px;text-align:center;">
                        <div style="font-size:28px;font-weight:800;color:#0369a1;">${contactCount}</div>
                        <div style="font-size:12px;color:#0ea5e9;">Wants Contact</div>
                      </div>
                    </td>
                    <td width="33%" style="padding:4px;">
                      <div style="background:#fef2f2;border-radius:12px;padding:16px;text-align:center;">
                        <div style="font-size:28px;font-weight:800;color:#be123c;">${total > 0 ? Math.round((contactCount / total) * 100) : 0}%</div>
                        <div style="font-size:12px;color:#f43f5e;">Contact Rate</div>
                      </div>
                    </td>
                  </tr>
                </table>

                ${topInterests.length > 0 ? `
                  <h3 style="color:#4338ca;font-size:16px;margin:24px 0 8px 0;">🎯 Top Interests</h3>
                  <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
                    ${buildBar(topInterests, allInterests.length)}
                  </table>
                ` : ""}

                ${topBarriers.length > 0 ? `
                  <h3 style="color:#b45309;font-size:16px;margin:24px 0 8px 0;">🚧 Top Barriers</h3>
                  <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
                    ${buildBar(topBarriers, allBarriers.length)}
                  </table>
                ` : ""}

                ${topChannels.length > 0 ? `
                  <h3 style="color:#7c3aed;font-size:16px;margin:24px 0 8px 0;">📢 Preferred Channels</h3>
                  <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
                    ${buildBar(topChannels, allChannels.length)}
                  </table>
                ` : ""}

                ${timesCount.length > 0 ? `
                  <h3 style="color:#047857;font-size:16px;margin:24px 0 8px 0;">⏰ Preferred Times</h3>
                  <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
                    ${buildBar(timesCount, allTimes.length)}
                  </table>
                ` : ""}

                ${childcareCount.length > 0 ? `
                  <h3 style="color:#be123c;font-size:16px;margin:24px 0 8px 0;">👶 Childcare Needs</h3>
                  <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
                    ${buildBar(childcareCount, allChildcare.length)}
                  </table>
                ` : ""}

                ${latestResponses.length > 0 ? `
                  <h3 style="color:#475569;font-size:16px;margin:24px 0 8px 0;">📋 Latest Responses (${latestResponses.length})</h3>
                  <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
                    <thead>
                      <tr style="background:#f1f5f9;">
                        <th style="padding:6px 10px;border:1px solid #e0e0e0;text-align:left;font-size:12px;">Date</th>
                        <th style="padding:6px 10px;border:1px solid #e0e0e0;text-align:left;font-size:12px;">Lang</th>
                        <th style="padding:6px 10px;border:1px solid #e0e0e0;text-align:left;font-size:12px;">Interests</th>
                        <th style="padding:6px 10px;border:1px solid #e0e0e0;text-align:left;font-size:12px;">Contact</th>
                      </tr>
                    </thead>
                    <tbody>${latestRows}</tbody>
                  </table>
                ` : ""}

                <p style="color:#999;font-size:12px;margin:24px 0 0 0;">
                  View full results at <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://vivaresource.com"}/admin/surveys" style="color:#025689;">admin panel</a>.
                </p>
              </td></tr>
              <tr><td style="background-color:#f3f3f3;padding:24px 32px;text-align:center;border-top:1px solid #e0e0e0;">
                <p style="margin:0 0 8px 0;color:#666;font-size:14px;">Viva Resource</p>
                <p style="margin:0;color:#999;font-size:12px;">Building a more resilient community together.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>`;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: getAdminEmails(),
      subject: `[Viva Resource] Weekly Survey Report — ${since.toLocaleDateString()} to ${now.toLocaleDateString()}`,
      html,
    });

    console.log(`[Survey Report] Sent weekly report (${total} responses) to ${getAdminEmails().length} recipients`);
    return NextResponse.json({ success: true, total });
  } catch (error: unknown) {
    console.error("[Survey Report] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}