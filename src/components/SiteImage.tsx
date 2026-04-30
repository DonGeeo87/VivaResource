import Image from 'next/image';
import type { SiteImageKey } from '@/types/site-images';
import { getSiteImage } from '@/lib/site-images';

interface SiteImageProps {
  key: SiteImageKey;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

export default async function SiteImage({
  key,
  alt,
  className = '',
  priority = false,
  fill = false,
  sizes,
  style,
  width,
  height,
}: SiteImageProps) {
  const image = await getSiteImage(key);
  const src = image ? `${image.path}?v=${image.updatedAt.seconds}` : '/placeholder.jpg';

  return (
    <Image
      src={src}
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
