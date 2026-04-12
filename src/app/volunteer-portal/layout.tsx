import type { Metadata } from "next";
import { generatePageMeta } from "@/lib/metadata";

export const metadata: Metadata = generatePageMeta({
  title: "Volunteer Portal - Panel de Voluntarios",
  description: "Access your volunteer dashboard, view assigned tasks, read messages from admins, and track your volunteer impact at Viva Resource Foundation Colorado.",
  path: "/volunteer-portal",
  keywords: ["volunteer portal Colorado", "panel de voluntarios", "volunteer dashboard", "Colorado nonprofit volunteer portal"],
});

export { default } from "./client-layout";
