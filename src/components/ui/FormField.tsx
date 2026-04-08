"use client";

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required = false,
  helpText,
  children,
  className = "",
}: BaseFieldProps): JSX.Element {
  const fieldId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label 
        htmlFor={fieldId} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>
      
      {children}
      
      {helpText && !error && (
        <p id={`${fieldId}-help`} className="text-xs text-gray-500">
          {helpText}
        </p>
      )}
      
      {error && (
        <p 
          id={`${fieldId}-error`} 
          className="flex items-center gap-1 text-xs text-red-600" 
          role="alert"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    const fieldId = props.id || (props.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "");
    
    return (
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          error ? `${fieldId}-error` : props["aria-describedby"]
        }
        className={`
          w-full px-4 py-3 border rounded-xl
          text-gray-900 placeholder-gray-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:border-transparent
          ${error 
            ? "border-red-300 focus:ring-red-200" 
            : "border-gray-300 focus:ring-primary/20"
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => {
    const fieldId = props.id || (props.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "");
    
    return (
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          error ? `${fieldId}-error` : props["aria-describedby"]
        }
        className={`
          w-full px-4 py-3 border rounded-xl
          text-gray-900 placeholder-gray-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:border-transparent
          resize-none
          ${error 
            ? "border-red-300 focus:ring-red-200" 
            : "border-gray-300 focus:ring-primary/20"
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = "", ...props }, ref) => {
    const fieldId = props.id || (props.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "");
    
    return (
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          error ? `${fieldId}-error` : props["aria-describedby"]
        }
        className={`
          w-full px-4 py-3 border rounded-xl
          text-gray-900
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:border-transparent
          ${error 
            ? "border-red-300 focus:ring-red-200" 
            : "border-gray-300 focus:ring-primary/20"
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const fieldId = props.id || (props.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "");
    
    return (
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={fieldId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={`
            mt-1 h-4 w-4 rounded border-gray-300
            text-primary focus:ring-primary/20
            ${error ? "border-red-300" : ""}
            ${className}
          `}
          {...props}
        />
        <label htmlFor={fieldId} className="text-sm text-gray-600 cursor-pointer">
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = "", ...props }, ref) => {
    const fieldId = props.id || (props.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "");
    
    return (
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          type="radio"
          id={fieldId}
          className={`
            mt-1 h-4 w-4 border-gray-300
            text-primary focus:ring-primary/20
            ${className}
          `}
          {...props}
        />
        <label htmlFor={fieldId} className="text-sm text-gray-600 cursor-pointer">
          {label}
        </label>
      </div>
    );
  }
);

Radio.displayName = "Radio";
