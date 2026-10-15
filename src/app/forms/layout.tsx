import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

/**
 * Los formularios publicos (/forms/[id]) son paginas utilitarias y dinamicas:
 * sirven para responder, no para posicionar. Se excluyen del indice pero se
 * permite seguir los enlaces.
 */
export function generateMetadata(): Metadata {
  return {
    ...generatePageMeta({
      title: "Form",
      description: "Submit a Viva Resource form.",
      titleEs: "Formulario",
      descriptionEs: "Envía un formulario de Viva Resource.",
      path: "/forms",
    }),
    robots: { index: false, follow: true },
  };
}

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
