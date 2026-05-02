"use client";

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { getAllSiteImages } from "@/lib/site-images";
import type { SiteImageKey } from "@/types/site-images";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-image-defaults";

type ImageMap = Record<string, string>;

interface SiteImageContextValue {
  overrides: ImageMap;
  loaded: boolean;
}

const SiteImageContext = createContext<SiteImageContextValue>({
  overrides: {},
  loaded: false,
});

export function SiteImageProvider({ children }: { children: ReactNode }): JSX.Element {
  const [overrides, setOverrides] = useState<ImageMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllSiteImages()
      .then((all) => {
        if (cancelled) return;
        const diffs: ImageMap = {};
        let hasDiff = false;
        for (const [key, path] of Object.entries(all)) {
          const def = SITE_IMAGE_DEFAULTS[key as SiteImageKey]?.path;
          if (path && def && path !== def) {
            diffs[key] = path;
            hasDiff = true;
          }
        }
        if (hasDiff) {
          setOverrides(diffs);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <SiteImageContext.Provider value={{ overrides, loaded }}>
      {children}
    </SiteImageContext.Provider>
  );
}

export function useSiteImage(key: SiteImageKey): string {
  const { overrides } = useContext(SiteImageContext);
  return useMemo(
    () => overrides[key] ?? SITE_IMAGE_DEFAULTS[key]?.path ?? "",
    [key, overrides]
  );
}

export function useSiteImages(): ImageMap {
  const { overrides, loaded } = useContext(SiteImageContext);
  return useMemo(() => {
    if (!loaded) {
      // Return defaults immediately — no async waiting
      return Object.fromEntries(
        Object.entries(SITE_IMAGE_DEFAULTS).map(([k, v]) => [k, v.path])
      );
    }
    // Merge overrides on top of defaults
    const all: ImageMap = {};
    for (const [k, v] of Object.entries(SITE_IMAGE_DEFAULTS)) {
      all[k] = overrides[k] ?? v.path;
    }
    return all;
  }, [loaded, overrides]);
}
