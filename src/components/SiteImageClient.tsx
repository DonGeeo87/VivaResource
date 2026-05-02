"use client";

import Image from "next/image";
import type { SiteImageKey } from "@/types/site-images";
import { useSiteImage } from "@/hooks/useSiteImage";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-image-defaults";

interface SiteImageClientProps {
  imageKey: SiteImageKey;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

export default function SiteImageClient({
  imageKey,
  alt,
  className = "",
  priority = false,
  fill = false,
  sizes,
  style,
  width,
  height,
}: SiteImageClientProps): JSX.Element {
  const { src } = useSiteImage(imageKey);
  const defaultSrc = SITE_IMAGE_DEFAULTS[imageKey]?.path ?? "";
  const finalSrc = src || defaultSrc;

  // For external URLs (Google, Unsplash, Cloudinary) we can't use Next/Image optimization
  // unless they're in next.config.js remotePatterns. We already have those configured.
  // But static local files work fine.
  const isExternal = finalSrc.startsWith("http://") || finalSrc.startsWith("https://");

  if (isExternal) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={finalSrc} alt={alt} className={className} style={style} width={width} height={height} />;
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      className={className}
      priority={priority}
      fill={fill}
      sizes={sizes}
      style={style}
      width={width}
      height={height}
    />
  );
}
