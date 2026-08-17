import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Cabecera uniforme para todas las páginas admin.
 * Título + descripción a la izquierda, acciones (botones) a la derecha.
 */
export default function PageHeader({
  title,
  description,
  actions,
  className = "",
}: PageHeaderProps): JSX.Element {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 ${className}`}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}
