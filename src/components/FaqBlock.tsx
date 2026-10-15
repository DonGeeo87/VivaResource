/**
 * Bloque de preguntas frecuentes visible + FAQPage structured data.
 *
 * Doble proposito: (1) la gente y los motores de respuesta necesitan respuestas
 * cortas y directas en la pagina, no solo parrafos de marketing; (2) el schema
 * solo es valido si las preguntas se ven en pantalla, asi que el mismo arreglo
 * alimenta a los dos.
 *
 * Nota: Google dejo de mostrar rich results de FAQ (ago-2023), asi que esto NO
 * es para estrellitas en Google: es para que Google, Bing y los motores de IA
 * puedan extraer respuestas exactas.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBlockProps {
  lang: "en" | "es";
  items: FaqItem[];
  title?: string;
  id?: string;
}

export default function FaqBlock({ lang, items, title, id = "faq" }: FaqBlockProps): JSX.Element | null {
  if (items.length === 0) return null;

  const heading = title || (lang === "es" ? "Preguntas frecuentes" : "Frequently asked questions");

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section id={id} className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mb-10 text-center">
        {heading}
      </h2>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.question} className="bg-surface-low rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-on-surface mb-3">{item.question}</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
