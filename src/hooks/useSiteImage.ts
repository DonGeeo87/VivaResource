"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllSiteImages } from "@/lib/site-images";
import type { SiteImageKey } from "@/types/site-images";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-image-defaults";

let sharedPromise: Promise<Record<string, string>> | null = null;
function loadAllOnce(): Promise<Record<string, string>> {
  if (!sharedPromise) {
    sharedPromise = getAllSiteImages().catch(() => ({}));
  }
  return sharedPromise;
}

export function resetSiteImageCache(): void {
  sharedPromise = null;
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

export function useSiteImage(key: SiteImageKey) {
  const defaultSrc = useMemo(() => SITE_IMAGE_DEFAULTS[key]?.path ?? "", [key]);
  const [src, setSrc] = useState<string>(defaultSrc);

  useEffect(() => {
    let cancelled = false;
    loadAllOnce().then(async (all) => {
      if (cancelled) return;
      const remote = all[key];
      if (remote && remote !== defaultSrc) {
        await preloadImage(remote);
        if (!cancelled) setSrc(remote);
      }
    });
    return () => { cancelled = true; };
  }, [key, defaultSrc]);

  return { src };
}

export function useSiteImages(keys: SiteImageKey[]) {
  const defaultMap = useMemo(() => {
    const map: Record<string, string> = {};
    keys.forEach((k) => { map[k] = SITE_IMAGE_DEFAULTS[k]?.path ?? ""; });
    return map;
  }, []);

  const [images, setImages] = useState<Record<string, string>>(defaultMap);

  useEffect(() => {
    let cancelled = false;
    loadAllOnce().then(async (all) => {
      if (cancelled) return;
      const overrides: Record<string, string> = {};
      let hasOverride = false;
      const preloads: Promise<void>[] = [];

      keys.forEach((k) => {
        const remote = all[k];
        const def = SITE_IMAGE_DEFAULTS[k]?.path ?? "";
        if (remote && remote !== def) {
          overrides[k] = remote;
          hasOverride = true;
          preloads.push(preloadImage(remote));
        }
      });

      if (hasOverride) {
        await Promise.all(preloads);
        if (!cancelled) {
          setImages((prev) => ({ ...prev, ...overrides }));
        }
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { images };
}
