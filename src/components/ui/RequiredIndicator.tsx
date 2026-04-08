"use client";

interface RequiredIndicatorProps {
  className?: string;
}

export default function RequiredIndicator({ 
  className = "" 
}: RequiredIndicatorProps): JSX.Element {
  return (
    <span 
      className={`text-red-500 ml-0.5 ${className}`}
      aria-hidden="true"
    >
      *
    </span>
  );
}

interface RequiredLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  helpText?: string;
}

export function RequiredLabel({
  children,
  required = false,
  className = "",
  helpText,
}: RequiredLabelProps): JSX.Element {
  const id = children?.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "field";
  
  return (
    <div className="space-y-1">
      <label 
        htmlFor={id}
        className={`block text-sm font-medium text-gray-700 ${className}`}
      >
        {children}
        {required && <RequiredIndicator />}
        {required && <span className="sr-only">(required)</span>}
      </label>
      {helpText && (
        <p id={`${id}-help`} className="text-xs text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}
