import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const controlBase =
  "w-full px-3 py-2 text-sm bg-surface-lowest border rounded-md text-on-surface placeholder:text-outline transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed";

const borderFor = (error?: string, success?: boolean) =>
  error ? "border-red-300" : success ? "border-emerald-300" : "border-outline-low";

interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  helper?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Grupo de campo: etiqueta visible + control + ayuda/error. */
export function Field({ label, htmlFor, required, helper, error, children, className = "" }: FieldProps): JSX.Element {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : helper ? (
        <p className="text-xs text-on-surface-variant">{helper}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string; success?: boolean }>(
  ({ className = "", error, success, ...props }, ref) => (
    <input ref={ref} className={`${controlBase} ${borderFor(error, success)} ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }>(
  ({ className = "", error, ...props }, ref) => (
    <textarea ref={ref} className={`${controlBase} ${borderFor(error)} ${className}`} {...props} />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { error?: string }>(
  ({ className = "", error, children, ...props }, ref) => (
    <select ref={ref} className={`${controlBase} ${borderFor(error)} ${className}`} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";
