import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

export interface AdminButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "xs" | "sm" | "md";
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Botón admin unificado (bordes finos, compacto, rounded-md).
 * Variantes:
 * - primary:   azul marca sólido (acciones principales)
 * - secondary: gris neutro (acciones secundarias)
 * - outline:   borde fino (acciones terciarias / editar)
 * - danger:    rojo (eliminar/destructivas)
 * - ghost:     sin fondo (acciones de bajo énfasis / iconos)
 * Soporta icono + texto o solo icono (compacto).
 */
const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  (
    {
      variant = "primary",
      size = "sm",
      icon,
      iconRight,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap";

    const variants: Record<string, string> = {
      primary: "bg-primary text-white border-primary hover:bg-primary/90",
      secondary: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
      outline: "bg-transparent text-primary border-primary hover:bg-primary/5",
      danger: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
      ghost:
        "bg-transparent text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700",
    };

    const sizes: Record<string, string> = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
    };

    const width = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
        disabled={disabled}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

AdminButton.displayName = "AdminButton";

export default AdminButton;
