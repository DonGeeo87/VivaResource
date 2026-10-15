import { ReactNode, TableHTMLAttributes } from "react";

/**
 * Primitivas de tabla del panel: borde fino, encabezado compacto, filas con
 * hover sutil. Se usan juntas para que todas las tablas se vean iguales.
 */

export function Table({ children, className = "", ...props }: TableHTMLAttributes<HTMLTableElement>): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }): JSX.Element {
  return (
    <thead className="bg-surface-low border-b border-outline-low">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({
  children,
  align = "left",
  className = "",
}: {
  children?: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}): JSX.Element {
  return (
    <th
      className={`px-4 py-2.5 text-${align} text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

export function Tbody({ children }: { children: ReactNode }): JSX.Element {
  return <tbody className="divide-y divide-outline-low">{children}</tbody>;
}

export function Tr({ children, className = "" }: { children: ReactNode; className?: string }): JSX.Element {
  return <tr className={`hover:bg-surface-low transition-colors ${className}`}>{children}</tr>;
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children?: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}): JSX.Element {
  return <td className={`px-4 py-3 text-${align} text-on-surface-variant align-middle ${className}`}>{children}</td>;
}

/** Fila de estado vacio que ocupa toda la tabla. */
export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }): JSX.Element {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-on-surface-variant">
        {children}
      </td>
    </tr>
  );
}

/** Filas fantasma mientras carga. */
export function TableSkeleton({ rows = 3, cols }: { rows?: number; cols: number }): JSX.Element {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className={`h-4 bg-surface-high rounded ${c === 0 ? "w-3/4" : "w-1/2"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
