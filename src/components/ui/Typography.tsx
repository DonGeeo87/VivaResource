"use client";

import { ReactNode } from "react";

// ============================================
// TYPOGRAPHY COMPONENTS
// ============================================

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// Headings
export function H1({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold tracking-tight leading-tight ${className}`}>
      {children}
    </h1>
  );
}

export function H2({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <h2 className={`text-3xl md:text-4xl font-headline font-bold tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

export function H3({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <h3 className={`text-2xl md:text-3xl font-headline font-semibold ${className}`}>
      {children}
    </h3>
  );
}

export function H4({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <h4 className={`text-xl md:text-2xl font-headline font-semibold ${className}`}>
      {children}
    </h4>
  );
}

export function H5({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <h5 className={`text-lg md:text-xl font-headline font-medium ${className}`}>
      {children}
    </h5>
  );
}

export function H6({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <h6 className={`text-base md:text-lg font-headline font-medium ${className}`}>
      {children}
    </h6>
  );
}

// Body text
export function Body({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <p className={`text-base leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function BodyLarge({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <p className={`text-lg leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function BodySmall({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <p className={`text-sm leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function BodyMuted({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <p className={`text-base leading-relaxed text-gray-500 ${className}`}>
      {children}
    </p>
  );
}

// Labels
export function Label({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <span className={`text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}

export function LabelSmall({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <span className={`text-xs font-medium uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}

// Links
export function Link({ children, className = "" }: TypographyProps): JSX.Element {
  return (
    <a href="#" className={`text-primary hover:text-primary-hover underline-offset-2 hover:underline transition-colors ${className}`}>
      {children}
    </a>
  );
}

// Helper classes for text styling
export const textClasses = {
  // Sizes
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  
  // Weights
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  
  // Colors
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-gray-500",
  white: "text-white",
  
  // Alignment
  left: "text-left",
  center: "text-center",
  right: "text-right",
  
  // Transform
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
};

// Line heights
export const lineHeightClasses = {
  none: "leading-none",
  tight: "leading-tight",
  snug: "leading-snug",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

// Letter spacing
export const letterSpacingClasses = {
  tighter: "tracking-tighter",
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
  wider: "tracking-wider",
  widest: "tracking-widest",
};
