"use client";

import { ReactNode } from "react";

type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface SpacingSectionProps {
  children: ReactNode;
  size?: SpacingSize;
  className?: string;
  as?: "section" | "div" | "main" | "header" | "footer";
}


const responsiveSizeClasses: Record<SpacingSize, string> = {
  none: "py-0",
  xs: "py-2 md:py-4",
  sm: "py-4 md:py-8",
  md: "py-6 md:py-12",
  lg: "py-8 md:py-16",
  xl: "py-12 md:py-20",
  "2xl": "py-16 md:py-24",
  "3xl": "py-20 md:py-32",
};

export default function SpacingSection({
  children,
  size = "lg",
  className = "",
  as: Tag = "section",
}: SpacingSectionProps): JSX.Element {
  return (
    <Tag className={`${responsiveSizeClasses[size]} ${className}`}>
      {children}
    </Tag>
  );
}

// Spacing constants for consistent use
export const spacing = {
  // Padding
  p: {
    xs: "px-2 py-1",
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
    xl: "px-8 py-6",
  },
  
  // Margin
  m: {
    xs: "m-1",
    sm: "m-2",
    md: "m-4",
    lg: "m-6",
    xl: "m-8",
  },
  
  // Gap
  gap: {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  },
  
  // Space between
  spaceY: {
    xs: "space-y-1",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
  },
  
  spaceX: {
    xs: "space-x-1",
    sm: "space-x-2",
    md: "space-x-4",
    lg: "space-x-6",
    xl: "space-x-8",
  },
};

// Container variants
export const containerClasses = {
  sm: "max-w-3xl mx-auto px-4",
  md: "max-w-5xl mx-auto px-6",
  lg: "max-w-7xl mx-auto px-6",
  xl: "max-w-7xl mx-auto px-8",
};
