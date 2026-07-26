import { db, Timestamp, collection, doc, getDoc, getDocs, orderBy, query, setDoc } from "@/lib/db-client";
import type { SiteImage, SiteImageKey } from '@/types/site-images';
import { SITE_IMAGE_DEFAULTS } from './site-image-defaults';

function toJsDate(value: unknown): Date {
  if (!value) return new Date();
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  if (typeof value === 'number') {
    const ms = value < 10000000000 ? value * 1000 : value;
    return new Date(ms);
  }
  return new Date();
}

/**
 * Read all site_image docs from Firestore in a single query.
 * Returns a Record keyed by document ID.
 * NEVER writes to Firestore — read-only.
 */
export const getAllSiteImages = async (): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  const q = query(collection(db, 'site_images'), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  snapshot.docs.forEach((d) => {
    const data = d.data();
    if (data.path) {
      result[d.id] = data.path;
    }
  });
  return result;
};

export const getSiteImages = async (): Promise<SiteImage[]> => {
  const q = query(collection(db, 'site_images'), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);

  const existing = new Map<string, SiteImage>();
  snapshot.docs.forEach((d) => {
    const data = d.data();
    existing.set(d.id, {
      key: d.id as SiteImageKey,
      path: data.path ?? SITE_IMAGE_DEFAULTS[d.id as SiteImageKey]?.path ?? '',
      url: data.url,
      descriptionEn: data.descriptionEn ?? SITE_IMAGE_DEFAULTS[d.id as SiteImageKey]?.descriptionEn ?? '',
      descriptionEs: data.descriptionEs ?? SITE_IMAGE_DEFAULTS[d.id as SiteImageKey]?.descriptionEs ?? '',
      updatedAt: toJsDate(data.updatedAt),
    });
  });

  const allKeys = Object.keys(SITE_IMAGE_DEFAULTS) as SiteImageKey[];
  const results: SiteImage[] = [];

  for (const key of allKeys) {
    const def = SITE_IMAGE_DEFAULTS[key];
    if (existing.has(key)) {
      results.push(existing.get(key)!);
    } else {
      results.push({
        key,
        path: def.path,
        descriptionEn: def.descriptionEn,
        descriptionEs: def.descriptionEs,
        updatedAt: new Date(),
      });
    }
  }

  return results;
};

export const getSiteImage = async (key: SiteImageKey): Promise<SiteImage | null> => {
  const def = SITE_IMAGE_DEFAULTS[key];
  if (!def) return null;

  const docSnap = await getDoc(doc(db, 'site_images', key));
  if (!docSnap.exists()) {
    return { key, path: def.path, descriptionEn: def.descriptionEn, descriptionEs: def.descriptionEs, updatedAt: new Date() };
  }
  const data = docSnap.data();
  return {
    key: docSnap.id as SiteImageKey,
    path: data.path ?? def.path,
    url: data.url,
    descriptionEn: data.descriptionEn ?? def.descriptionEn,
    descriptionEs: data.descriptionEs ?? def.descriptionEs,
    updatedAt: toJsDate(data.updatedAt),
  };
};

export const updateSiteImage = async (key: string, data: Partial<SiteImage>) => {
  await setDoc(doc(db, 'site_images', key), {
    path: data.path,
    descriptionEn: data.descriptionEn,
    descriptionEs: data.descriptionEs,
    updatedAt: Timestamp.now()
  }, { merge: true });
};
