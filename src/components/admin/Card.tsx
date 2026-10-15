import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Superficie base del panel: fondo lowest, borde fino, radio consistente. */
export function Card({ children, className = "" }: CardProps): JSX.Element {
  return (
    <div className={`bg-surface-lowest border border-outline-low rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Cabecera de tarjeta: titulo + acciones, con divisor inferior. */
export function CardHeader({ title, icon, actions, className = "" }: CardHeaderProps): JSX.Element {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 border-b border-outline-low ${className}`}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-on-surface">
        {icon}
        {title}
      </h2>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps): JSX.Element {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
