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
      className={`flex flex-col items-center justify-center text-center py-12 px-6 border border-dashed border-gray-200 rounded-lg bg-gray-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6 text-gray-400" />}
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
