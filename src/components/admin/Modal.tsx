"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

/**
 * Dialogo unificado del panel: scrim, cierre con Escape y clic afuera,
 * animacion de entrada y foco en el contenido.
 */
export default function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/45 animate-backdrop-in" />
      <div
        className={`relative w-full ${SIZES[size]} bg-surface-lowest border border-outline-low rounded-lg shadow-ambient-xl animate-modal-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-outline-low">
            <h2 className="text-sm font-semibold text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1.5 rounded-md text-on-surface-variant hover:bg-surface-low transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-outline-low bg-surface-low/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
