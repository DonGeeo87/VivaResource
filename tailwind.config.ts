import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Trust
        primary: {
          DEFAULT: "#025689",
          container: "#2e6fa3",
          hover: "#014a75",
          active: "#013d61",
        },
        "on-primary": "#ffffff",
        "on-primary-container": "#ffffff",

        // Secondary - Hope
        secondary: {
          DEFAULT: "#416900",
          container: "#b7f569",
          hover: "#365700",
          active: "#2a4500",
        },
        "on-secondary": "#ffffff",
        "on-secondary-container": "#457000",

        // Surface colors
        surface: {
          DEFAULT: "#f9f9f9",
          lowest: "#ffffff",
          low: "#f3f3f3",
          high: "#e8e8e8",
          highest: "#dcdcdc",
        },
        "on-surface": {
          DEFAULT: "#1a1c1c",
          variant: "#41474f",
        },

        // Outline
        outline: {
          DEFAULT: "#717880",
          low: "#c4c7cc",
        },

        // Background and foreground aliases
        background: "#f9f9f9",
        foreground: "#1a1c1c",
      },
      fontFamily: {
        headline: ["var(--font-plus-jakarta)", "sans-serif"],
        body: ["var(--font-public-sans)", "sans-serif"],
        sans: ["var(--font-public-sans)", "sans-serif"],
      },
      borderRadius: {
        none: "0",
        sm: "0.5rem",
        DEFAULT: "0.75rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        // Ambient soft shadows - no hard shadows
        ambient: "0 2px 8px rgba(26, 28, 28, 0.04)",
        "ambient-md": "0 4px 16px rgba(26, 28, 28, 0.06)",
        "ambient-lg": "0 8px 24px rgba(26, 28, 28, 0.08)",
        "ambient-xl": "0 12px 32px rgba(26, 28, 28, 0.1)",
        // Glassmorphism shadow for navigation
        glass: "0 4px 24px rgba(2, 86, 137, 0.08)",
      },
      backdropBlur: {
        glass: "12px",
      },
      keyframes: {
        "modal-in": {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(-10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "modal-out": {
          "0%": { opacity: "1", transform: "scale(1) translateY(0)" },
          "100%": { opacity: "0", transform: "scale(0.95) translateY(-10px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "modal-in": "modal-in 0.2s ease-out",
        "modal-out": "modal-out 0.2s ease-in",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
