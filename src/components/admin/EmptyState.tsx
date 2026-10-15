import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Estado vacío uniforme para listados admin.
 * Icono + título + descripción opcional + acción opcional.
 */
export default function EmptyState({
  title,
  description,
  action,
  icon,
  className = "",
}: EmptyStateProps): JSX.Element {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6 text-outline" />}
      </div>
      <p className="text-sm font-medium text-on-surface">{title}</p>
      {description && (
        <p className="text-sm text-on-surface-variant mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
