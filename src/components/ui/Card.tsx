"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  onClick,
}: CardProps): JSX.Element {
  const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-100";
  const hoverClasses = hover
    ? "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    : "";
  const paddingClass = paddingClasses[padding];

  if (onClick) {
    return (
      <button
        onClick={onClick}
        type="button"
        className={`${baseClasses} ${hoverClasses} ${paddingClass} ${className} w-full text-left`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps): JSX.Element {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({ children, className = "", as: Tag = "h3" }: CardTitleProps): JSX.Element {
  return (
    <Tag className={`font-bold text-gray-900 ${className}`}>
      {children}
    </Tag>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = "" }: CardDescriptionProps): JSX.Element {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps): JSX.Element {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps): JSX.Element {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
