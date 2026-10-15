import { ReactNode } from "react";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-high text-on-surface-variant border-outline-low",
  brand: "bg-primary/5 text-primary border-primary/20",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

/** Mapea estados comunes de la app a un tono semantico. */
export function toneForStatus(status: string): BadgeTone {
  switch (status) {
    case "published":
    case "approved":
    case "active":
    case "confirmed":
    case "success":
      return "success";
    case "pending":
    case "draft":
    case "processing":
      return "warning";
    case "rejected":
    case "closed":
    case "cancelled":
    case "error":
      return "danger";
    default:
      return "neutral";
  }
}

interface StatusBadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  status?: string;
  className?: string;
}

/** Etiqueta de estado compacta (borde fino, mayusculas). */
export default function StatusBadge({ children, tone, status, className = "" }: StatusBadgeProps): JSX.Element {
  const resolvedTone = tone || (status ? toneForStatus(status) : "neutral");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${TONES[resolvedTone]} ${className}`}
    >
      {children}
    </span>
  );
}
