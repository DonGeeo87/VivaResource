import type { Metadata } from "next";
import { langContext } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const isEs = langContext().lang === "es";
  return {
    title: isEs ? "Política de privacidad" : "Privacy Policy",
    description: isEs
      ? "Cómo Viva Resource protege los datos y la dignidad de las familias que acompañamos: qué información recopilamos, para qué la usamos y cómo pedir que se elimine."
      : "How Viva Resource protects the data and dignity of the families we serve: what we collect, why we collect it, and how to ask us to delete it.",
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
