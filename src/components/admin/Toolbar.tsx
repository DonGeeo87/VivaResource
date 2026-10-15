import { ReactNode } from "react";
import { Search } from "lucide-react";

/** Fila de controles (busqueda + filtros + acciones) sobre un listado. */
export function Toolbar({ children, className = "" }: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className = "" }: SearchInputProps): JSX.Element {
  return (
    <div className={`relative flex-1 min-w-0 ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-sm bg-surface-lowest border border-outline-low rounded-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  );
}

/** Select compacto para filtros. */
export function FilterSelect({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 text-sm bg-surface-lowest border border-outline-low rounded-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${className}`}
    >
      {children}
    </select>
  );
}
