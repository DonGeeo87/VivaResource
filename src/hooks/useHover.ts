"use client";

import { useState, useCallback, useRef } from "react";

interface UseHoverOptions {
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function useHover<T extends HTMLElement = HTMLElement>(
  options: UseHoverOptions = {}
) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);
  const { onHoverStart, onHoverEnd } = options;

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onHoverStart?.();
  }, [onHoverStart]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  const hoverProps = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  return {
    ref,
    isHovered,
    hoverProps,
    bind: {
      ref,
      ...hoverProps,
    },
  };
}

// Utility classes for consistent hover states
export const hoverClasses = {
  // Scale transform
  scale: "transition-transform duration-200 hover:scale-105",
  scaleSm: "transition-transform duration-200 hover:scale-102",
  scaleLg: "transition-transform duration-200 hover:scale-110",
  
  // Translate
  lift: "transition-all duration-200 hover:-translate-y-1",
  liftSm: "transition-all duration-200 hover:-translate-y-0.5",
  liftLg: "transition-all duration-200 hover:-translate-y-2",
  
  // Shadow
  shadow: "transition-shadow duration-200 hover:shadow-md",
  shadowLg: "transition-shadow duration-200 hover:shadow-lg",
  
  // Combined common patterns
  card: "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
  button: "transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
  link: "transition-colors duration-200 hover:text-primary",
  
  // Background
  bgHover: "transition-colors duration-200 hover:bg-gray-50",
  bgPrimary: "transition-colors duration-200 hover:bg-primary/90",
  
  // All interactive elements
  interactive: "transition-all duration-200 ease-out",
};
