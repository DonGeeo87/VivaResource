import { collection, doc, getDoc, getDocs, setDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase/config';
import type { SiteImage } from '@/types/site-images';

export const getSiteImages = async (): Promise<SiteImage[]> => {
  const q = query(collection(db, 'site_images'), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ key: d.id, ...d.data() })) as SiteImage[];
};

export const getSiteImage = async (key: string): Promise<SiteImage | null> => {
  const docSnap = await getDoc(doc(db, 'site_images', key));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    key: docSnap.id as SiteImage['key'],
    path: data.path,
    url: data.url,
    descriptionEn: data.descriptionEn,
    descriptionEs: data.descriptionEs,
    updatedAt: data.updatedAt,
  };
};

export const updateSiteImage = async (key: string, data: Partial<SiteImage>) => {
  await setDoc(doc(db, 'site_images', key), {
    ...data,
    updatedAt: Timestamp.now()
  }, { merge: true });
};