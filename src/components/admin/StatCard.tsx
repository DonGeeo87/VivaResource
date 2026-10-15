import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BadgeTone } from "./StatusBadge";

const ICON_TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-high text-on-surface-variant",
  brand: "bg-primary/10 text-primary",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
  info: "bg-sky-50 text-sky-600",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  href?: string;
  tone?: BadgeTone;
  loading?: boolean;
}

/**
 * Tarjeta de KPI. Una sola familia de color (marca) por defecto para que el
 * dashboard se vea cohesionado en lugar de un arcoiris.
 */
export default function StatCard({ label, value, icon, href, tone = "brand", loading = false }: StatCardProps): JSX.Element {
  const body = (
    <div className="flex items-center gap-3 p-4 h-full">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ICON_TONES[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-on-surface leading-none tabular-nums">
          {loading ? "—" : value}
        </p>
        <p className="text-xs text-on-surface-variant mt-1 truncate">{label}</p>
      </div>
      {href && <ArrowRight className="w-4 h-4 text-outline ml-auto flex-shrink-0" />}
    </div>
  );

  const base = "bg-surface-lowest border border-outline-low rounded-lg transition-colors";
  if (href) {
    return (
      <Link href={href} className={`${base} hover:border-primary/30 hover:bg-surface-low`}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}
