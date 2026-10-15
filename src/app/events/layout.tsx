import type { Metadata } from "next";
import { generatePageMeta, langContext } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site-url";
import SchemaMarkup from "@/components/SchemaMarkup";
import { adminDb } from "@/lib/admin-db";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Free Workshops and Classes in Colorado",
    description: "Upcoming free workshops and community gatherings for rural families in El Paso County, Colorado. Bilingual and open to everyone. See dates and register.",
    titleEs: "Talleres y clases gratis en Colorado",
    descriptionEs:
      "Próximos talleres gratuitos y encuentros comunitarios para familias rurales del Condado de El Paso, Colorado. Bilingües y abiertos a toda la comunidad.",
    path: "/events",
    keywords: ["community events Colorado", "eventos comunitarios Colorado", "talleres gratuitos Colorado", "free workshops Peyton", "Viva Resource events"],
  });
}

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  try {
    if (typeof value === "object" && value !== null && "toDate" in (value as Record<string, unknown>)) {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }
    if (value instanceof Date) return value.toISOString();
    const parsed = new Date(value as string);
    return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  } catch {
    return undefined;
  }
}

/**
 * El schema de eventos se emite en el servidor (no en la pagina cliente) para
 * que tambien lo lean los bots que no ejecutan JavaScript. Se limita al indice
 * /events para no duplicarlo en la pantalla de registro, que emite su propio
 * Event individual.
 */
async function getEventSchemaItems(lang: "en" | "es") {
  try {
    const db = await adminDb();
    const snap = await db.collection("events").where("status", "==", "published").get();
    return snap.docs
      .map((doc: { data: () => Record<string, unknown> }) => doc.data())
      .map((event) => ({
        name: ((lang === "es" && event.title_es ? event.title_es : event.title_en) as string) || "",
        description: ((lang === "es" && event.description_es ? event.description_es : event.description_en) as string) || "",
        startDate: toIso(event.date),
        endDate: toIso((event.dates as { date?: unknown }[] | undefined)?.[0]?.date),
        location: event.location as string | undefined,
        url: `${SITE_URL}/events/register/${event.id as string}`,
        image: (event.image_url as string) || (event.image as string) || undefined,
      }))
      .filter((event) => event.name);
  } catch (error) {
    console.warn("[events] No se pudo construir el schema de eventos:", error);
    return [];
  }
}

export default async function EventsLayout({ children }: { children: React.ReactNode }) {
  const { lang, barePath } = langContext();
  const isIndex = barePath === "/events";
  const items = isIndex ? await getEventSchemaItems(lang) : [];

  return (
    <>
      {items.length > 0 && <SchemaMarkup type="eventList" data={{ events: items }} />}
      {children}
    </>
  );
}
