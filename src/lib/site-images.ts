import { collection, doc, getDoc, getDocs, setDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase/config';
import type { SiteImage, SiteImageKey } from '@/types/site-images';
import { SITE_IMAGE_DEFAULTS } from './site-image-defaults';

/**
 * Safe conversion of Firestore data to JS Date.
 * Handles: Timestamp, Date, string, number, or undefined.
 */
function toJsDate(value: unknown): Date {
  if (!value) return new Date();
  // Firestore Timestamp has toDate()
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  // JS Date
  if (value instanceof Date) {
    return value;
  }
  // String
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  // Number (ms or seconds)
  if (typeof value === 'number') {
    // Assume seconds if small enough (before year 2100 in seconds)
    const ms = value < 10000000000 ? value * 1000 : value;
    return new Date(ms);
  }
  return new Date();
}

export const getSiteImages = async (): Promise<SiteImage[]> => {
  const q = query(collection(db, 'site_images'), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);

  const existing = new Map<string, SiteImage>();
  snapshot.docs.forEach((d) => {
    const data = d.data();
    existing.set(d.id, {
      key: d.id as SiteImageKey,
      path: data.path ?? '',
      url: data.url,
      descriptionEn: data.descriptionEn ?? '',
      descriptionEs: data.descriptionEs ?? '',
      updatedAt: toJsDate(data.updatedAt),
    });
  });

  // Ensure all known keys exist, creating defaults in Firestore if missing
  const allKeys = Object.keys(SITE_IMAGE_DEFAULTS) as SiteImageKey[];
  const results: SiteImage[] = [];

  for (const key of allKeys) {
    const def = SITE_IMAGE_DEFAULTS[key];
    if (!existing.has(key)) {
      // Create default document in Firestore
      const newDoc: SiteImage = {
        key,
        path: def.path,
        descriptionEn: def.descriptionEn,
        descriptionEs: def.descriptionEs,
        updatedAt: new Date(),
      };
      await setDoc(doc(db, 'site_images', key), {
        path: newDoc.path,
        descriptionEn: newDoc.descriptionEn,
        descriptionEs: newDoc.descriptionEs,
        updatedAt: Timestamp.now(),
      });
      results.push(newDoc);
    } else {
      results.push(existing.get(key)!);
    }
  }

  return results;
};

export const getSiteImage = async (key: SiteImageKey): Promise<SiteImage | null> => {
  const docSnap = await getDoc(doc(db, 'site_images', key));
  if (!docSnap.exists()) {
    const def = SITE_IMAGE_DEFAULTS[key];
    if (!def) return null;
    // Seed default
    await setDoc(doc(db, 'site_images', key), {
      path: def.path,
      descriptionEn: def.descriptionEn,
      descriptionEs: def.descriptionEs,
      updatedAt: Timestamp.now(),
    });
    return {
      key,
      path: def.path,
      descriptionEn: def.descriptionEn,
      descriptionEs: def.descriptionEs,
      updatedAt: new Date(),
    };
  }
  const data = docSnap.data();
  return {
    key: docSnap.id as SiteImageKey,
    path: data.path ?? SITE_IMAGE_DEFAULTS[key]?.path ?? '',
    url: data.url,
    descriptionEn: data.descriptionEn ?? SITE_IMAGE_DEFAULTS[key]?.descriptionEn ?? '',
    descriptionEs: data.descriptionEs ?? SITE_IMAGE_DEFAULTS[key]?.descriptionEs ?? '',
    updatedAt: toJsDate(data.updatedAt),
  };
};

export const updateSiteImage = async (key: string, data: Partial<SiteImage>) => {
  await setDoc(doc(db, 'site_images', key), {
    ...data,
    updatedAt: Timestamp.now()
  }, { merge: true });
};
