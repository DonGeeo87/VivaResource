"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAllSiteImages } from "@/lib/site-images";
import type { SiteImageKey } from "@/types/site-images";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-image-defaults";

type ImageMap = Record<string, string>;

function buildDefaults(): ImageMap {
  const map: ImageMap = {};
  for (const [k, v] of Object.entries(SITE_IMAGE_DEFAULTS)) {
    map[k] = v.path;
  }
  return map;
}

const defaultMap = buildDefaults();

const SiteImageContext = createContext<ImageMap>(defaultMap);

export function SiteImageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [allImages] = useState<ImageMap>(defaultMap);

  useEffect(() => {
    getAllSiteImages().then((overrides) => {
      const entries = Object.entries(overrides);
      for (let i = 0; i < entries.length; i++) {
        const [k, v] = entries[i];
        if (v && defaultMap[k] !== v) {
          defaultMap[k] = v;
        }
      }
    }).catch(() => {});
  }, []);

  return (
    <SiteImageContext.Provider value={allImages}>
      {children}
    </SiteImageContext.Provider>
  );
}

export function useSiteImage(key: SiteImageKey): string {
  return useContext(SiteImageContext)[key] ?? "";
}

export function useSiteImages(): ImageMap {
  return useContext(SiteImageContext);
}
