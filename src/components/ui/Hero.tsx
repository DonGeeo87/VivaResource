import { HTMLAttributes, forwardRef } from "react";

export interface HeroProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "gradient" | "image" | "solid";
  title: string;
  subtitle?: string;
  badge?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  align?: "left" | "center";
}

const Hero = forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      variant = "gradient",
      title,
      subtitle,
      badge,
      backgroundImage,
      overlayOpacity = 0.9,
      align = "left",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const getBackgroundStyles = () => {
      if (variant === "gradient") {
        return "bg-gradient-to-br from-primary to-primary-container";
      }
      if (variant === "image" && backgroundImage) {
        return "bg-gray-900";
      }
      if (variant === "solid") {
        return "bg-primary";
      }
      return "bg-gradient-to-br from-primary to-primary-container";
    };

    return (
      <section
        ref={ref}
        className={`relative min-h-[500px] flex items-center py-20 px-6 overflow-hidden ${getBackgroundStyles()} ${className}`}
        {...props}
      >
        {variant === "image" && backgroundImage && (
          <>
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${backgroundImage}')` }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-secondary/80"
                style={{ opacity: overlayOpacity }}
              />
            </div>
          </>
        )}

        <div className={`max-w-7xl mx-auto w-full relative z-10 ${align === "center" ? "text-center" : ""}`}>
          <div className={align === "center" ? "max-w-3xl mx-auto" : "max-w-2xl"}>
            {badge && (
              <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase mb-6">
                {badge}
              </span>
            )}
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tighter mb-6">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-xl">
                {subtitle}
              </p>
            )}
            {children && (
              <div className={`flex flex-wrap gap-4 mt-8 ${align === "center" ? "justify-center" : ""}`}>
                {children}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

Hero.displayName = "Hero";

export default Hero;
