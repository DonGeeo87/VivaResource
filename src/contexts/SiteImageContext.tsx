"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAllSiteImages } from "@/lib/site-images";
import type { SiteImageKey } from "@/types/site-images";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-image-defaults";

type ImageMap = Record<string, string>;

const SiteImageContext = createContext<ImageMap>({});

export function SiteImageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [allImages, setAllImages] = useState<ImageMap>(() => {
    const map: ImageMap = {};
    for (const [k, v] of Object.entries(SITE_IMAGE_DEFAULTS)) {
      map[k] = v.path;
    }
    return map;
  });

  useEffect(() => {
    let cancelled = false;
    getAllSiteImages().then((overrides) => {
      if (cancelled) return;
      setAllImages((prev) => {
        const hasDiff = Object.entries(overrides).some(
          ([k, v]) => prev[k] !== v
        );
        if (!hasDiff) return prev;
        return { ...prev, ...overrides };
      });
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <SiteImageContext.Provider value={allImages}>
      {children}
    </SiteImageContext.Provider>
  );
}

export function useSiteImage(key: SiteImageKey): string {
  const allImages = useContext(SiteImageContext);
  return allImages[key] ?? "";
}

export function useSiteImages(): ImageMap {
  return useContext(SiteImageContext);
}
