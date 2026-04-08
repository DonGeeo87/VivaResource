"use client";

import { ReactNode } from "react";

type HoverEffect = "lift" | "scale" | "shadow" | "glow" | "none";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: HoverEffect;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  href?: string;
}

const hoverEffectClasses: Record<HoverEffect, string> = {
  lift: "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
  scale: "transition-all duration-200 hover:scale-[1.02]",
  shadow: "transition-shadow duration-200 hover:shadow-xl",
  glow: "transition-all duration-200 hover:shadow-[0_0_20px_rgba(2,86,137,0.15)]",
  none: "",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function InteractiveCard({
  children,
  className = "",
  hoverEffect = "lift",
  padding = "md",
  onClick,
}: InteractiveCardProps): JSX.Element {
  const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-100";
  const hoverClasses = hoverEffectClasses[hoverEffect];
  const paddingClass = paddingClasses[padding];

  if (onClick) {
    return (
      <button
        onClick={onClick}
        type="button"
        className={`${baseClasses} ${hoverClasses} ${paddingClass} ${className} w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
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
