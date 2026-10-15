import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return generatePageMeta({
    title: "Volunteer Portal",
    description: "Access your volunteer dashboard: assigned tasks, messages from the team and your volunteer impact with Viva Resource in Colorado.",
    titleEs: "Panel de voluntarios",
    descriptionEs:
      "Entra a tu panel de voluntario: tareas asignadas, mensajes del equipo y el impacto de tu trabajo con Viva Resource en Colorado.",
    path: "/volunteer-portal",
    keywords: ["volunteer portal Colorado", "panel de voluntarios", "volunteer dashboard", "Colorado nonprofit volunteer portal"],
  });
}

export { default } from "./client-layout";
