"use client";

import { useEffect, useState, useMemo } from "react";
import { getSiteImage } from "@/lib/site-images";
import type { SiteImageKey } from "@/types/site-images";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-image-defaults";

export function useSiteImage(key: SiteImageKey) {
  const defaultSrc = useMemo(
    () => SITE_IMAGE_DEFAULTS[key]?.path ?? "",
    [key]
  );
  const [src, setSrc] = useState<string>(defaultSrc);

  useEffect(() => {
    let cancelled = false;
    getSiteImage(key)
      .then((img) => {
        if (cancelled) return;
        if (img?.path && img.path !== defaultSrc) {
          setSrc(img.path);
        }
      })
      .catch(() => {
        // keep default
      });
    return () => {
      cancelled = true;
    };
  }, [key, defaultSrc]);

  // If default changes (e.g. on key swap), sync
  useEffect(() => {
    setSrc(defaultSrc);
  }, [defaultSrc]);

  return { src };
}

export function useSiteImages(keys: SiteImageKey[]) {
  const defaultMap = useMemo(() => {
    const map: Record<string, string> = {};
    keys.forEach((k) => {
      map[k] = SITE_IMAGE_DEFAULTS[k]?.path ?? "";
    });
    return map;
  }, []);

  const [images, setImages] = useState<Record<string, string>>(defaultMap);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      keys.map((key) =>
        getSiteImage(key).then((img) => ({
          key,
          path: img?.path ?? SITE_IMAGE_DEFAULTS[key]?.path ?? "",
        }))
      )
    )
      .then((results) => {
        if (cancelled) return;
        const overrides: Record<string, string> = {};
        let hasOverride = false;
        results.forEach((r) => {
          const def = SITE_IMAGE_DEFAULTS[r.key]?.path ?? "";
          if (r.path && r.path !== def) {
            overrides[r.key] = r.path;
            hasOverride = true;
          }
        });
        if (hasOverride) {
          setImages((prev) => ({ ...prev, ...overrides }));
        }
      })
      .catch(() => {
        // keep defaults
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { images };
}
