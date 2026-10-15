import { ReactNode } from "react";

/** Contenedor estandar de pagina admin: ancho y ritmo vertical consistentes. */
export default function PageShell({ children, className = "" }: { children: ReactNode; className?: string }): JSX.Element {
  return <div className={`max-w-7xl mx-auto space-y-6 ${className}`}>{children}</div>;
}
