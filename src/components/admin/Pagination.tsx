"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Paginación compacta para listados admin.
 * - Bordes finos, rounded-md (consistente con el sistema admin)
 * - Muestra: < Anterior | 1 2 3 ... N | Siguiente >
 * - No renderiza nada si solo hay 1 página.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase =
    "inline-flex items-center justify-center w-8 h-8 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav
      aria-label="Paginación"
      className={`flex items-center gap-1.5 ${className}`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
        aria-label="Anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`${btnBase} ${
            p === currentPage
              ? "border-primary bg-primary text-white font-medium"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
        aria-label="Siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
