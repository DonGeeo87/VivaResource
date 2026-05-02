"use client";

import { useEffect, useState } from "react";
import { getSiteImage } from "@/lib/site-images";
import type { SiteImageKey } from "@/types/site-images";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-image-defaults";

export function useSiteImage(key: SiteImageKey) {
  const [src, setSrc] = useState<string>(SITE_IMAGE_DEFAULTS[key]?.path ?? "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSiteImage(key)
      .then((img) => {
        if (cancelled) return;
        if (img?.path) {
          setSrc(img.path);
        }
      })
      .catch(() => {
        // silently fall back to default
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [key]);

  return { src, loading };
}

export function useSiteImages(keys: SiteImageKey[]) {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const keyString = keys.join(",");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      keys.map((key) =>
        getSiteImage(key).then((img) => ({
          key,
          path: img?.path || SITE_IMAGE_DEFAULTS[key]?.path || "",
        }))
      )
    )
      .then((results) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        results.forEach((r) => {
          map[r.key] = r.path;
        });
        setImages(map);
      })
      .catch(() => {
        const map: Record<string, string> = {};
        keys.forEach((k) => {
          map[k] = SITE_IMAGE_DEFAULTS[k]?.path || "";
        });
        setImages(map);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [keyString]);

  return { images, loading };
}
