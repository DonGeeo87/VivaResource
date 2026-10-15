import type { SiteImageKey } from '@/types/site-images';

export interface SiteImageDefault {
  path: string;
  descriptionEn: string;
  descriptionEs: string;
  page: string;
  section: string;
}

export const SITE_IMAGE_DEFAULTS: Record<SiteImageKey, SiteImageDefault> = {
  'hero-01': {
    path: '/photo-new/photo_2026-04-20_13-45-57.jpg',
    descriptionEn: 'Hero section main image (desktop top-right circle)',
    descriptionEs: 'Imagen principal del hero (círculo superior derecho escritorio)',
    page: 'Home',
    section: 'Hero',
  },
  'hero-02': {
    path: '/photo-new/photo_2026-04-20_13-45-20.jpg',
    descriptionEn: 'Hero section bottom-left rounded image',
    descriptionEs: 'Imagen inferior izquierda del hero',
    page: 'Home',
    section: 'Hero',
  },
  'hero-03': {
    path: '/photo-new/photo_2026-04-20_13-44-57.jpg',
    descriptionEn: 'Hero section middle rotated image',
    descriptionEs: 'Imagen rotada del centro del hero',
    page: 'Home',
    section: 'Hero',
  },
  'about-hero': {
    path: '/photo-new/photo_2026-04-20_13-46-02.jpg',
    descriptionEn: 'About page hero image',
    descriptionEs: 'Imagen hero de la página About',
    page: 'About',
    section: 'Hero',
  },
  'about-section': {
    path: '/photo-new/photo_2026-04-20_13-45-49.jpg',
    descriptionEn: 'Home About section parallax image',
    descriptionEs: 'Imagen parallax de la sección About en Home',
    page: 'Home',
    section: 'About VIVA',
  },
  'get-help-hero': {
    path: '/photo-new/photo_2026-04-20_13-45-08.jpg',
    descriptionEn: 'Get Help page hero background',
    descriptionEs: 'Fondo hero de la página Get Help',
    page: 'Get Help',
    section: 'Hero',
  },
  'get-involved-hero': {
    path: '/photo-new/photo_2026-04-20_13-46-10.jpg',
    descriptionEn: 'Get Involved page hero image',
    descriptionEs: 'Imagen hero de la página Get Involved',
    page: 'Get Involved',
    section: 'Hero',
  },
  'get-involved-program': {
    path: '/photo-new/photo_2026-04-20_13-46-00.jpg',
    descriptionEn: 'Ambassador program card image',
    descriptionEs: 'Imagen de tarjeta del programa embajadores',
    page: 'Get Involved',
    section: 'Programs',
  },
  'pathway-food': {
    path: '/photo-new/photo_2026-04-20_13-45-48.jpg',
    descriptionEn: 'Pathway 01 - Food & Wellness',
    descriptionEs: 'Camino 01 - Alimentación y Bienestar',
    page: 'Home',
    section: 'Pathways',
  },
  'pathway-education': {
    path: '/photo-new/photo_2026-04-20_13-46-32.jpg',
    descriptionEn: 'Pathway 02 - Education & Training',
    descriptionEs: 'Camino 02 - Educación y Capacitación',
    page: 'Home',
    section: 'Pathways',
  },
  'pathway-community': {
    path: '/photo-new/photo_2026-04-20_13-45-11.jpg',
    descriptionEn: 'Pathway 03 - Community Building',
    descriptionEs: 'Camino 03 - Construcción Comunitaria',
    page: 'Home',
    section: 'Pathways',
  },
  'team-eva': {
    path: '/eva.avif',
    descriptionEn: 'Portrait of Eva Leon, co-founder',
    descriptionEs: 'Retrato de Eva Leon, co-fundadora',
    page: 'Home / About',
    section: 'Founders',
  },
  'team-monserrat': {
    path: '/monse.avif',
    descriptionEn: 'Portrait of Monserrat Mendoza, co-founder',
    descriptionEs: 'Retrato de Monserrat Mendoza, co-fundadora',
    page: 'Home / About',
    section: 'Founders',
  },
  'login-logo': {
    path: '/logo.png',
    descriptionEn: 'Admin login page logo',
    descriptionEs: 'Logo de la página de login admin',
    page: 'Admin Login',
    section: 'Logo',
  },
  'donate-hero': {
    path: '/photo-new/photo_2026-04-20_13-46-23.jpg',
    descriptionEn: 'Donate page hero image',
    descriptionEs: 'Imagen hero de la página Donate',
    page: 'Donate',
    section: 'Hero',
  },
  'donate-card': {
    path: '/photo-new/photo_2026-04-20_13-49-40.jpg',
    descriptionEn: 'Donate page impact card image',
    descriptionEs: 'Imagen de tarjeta de impacto en Donate',
    page: 'Donate',
    section: 'Impact',
  },
  'contact-hero': {
    path: '/photo-new/photo_2026-04-20_13-46-06.jpg',
    descriptionEn: 'Contact page hero image',
    descriptionEs: 'Imagen hero de la página Contact',
    page: 'Contact',
    section: 'Hero',
  },
  'contact-office': {
    path: '/photo-new/photo_2026-04-20_13-46-25.jpg',
    descriptionEn: 'Contact page office photo',
    descriptionEs: 'Foto de oficina en Contact',
    page: 'Contact',
    section: 'Office',
  },
  'contact-team': {
    path: '/photo-new/photo_2026-04-20_13-45-10.jpg',
    descriptionEn: 'Contact page team photo',
    descriptionEs: 'Foto del equipo en Contact',
    page: 'Contact',
    section: 'Team',
  },
  'get-help-accent': {
    path: '/photo-new/photo_2026-04-20_13-45-53.jpg',
    descriptionEn: 'Get Help sidebar accent image',
    descriptionEs: 'Imagen de acento en barra lateral de Get Help',
    page: 'Get Help',
    section: 'Sidebar',
  },
  'events-hero': {
    path: '/photo-new/photo_2026-04-20_13-45-30.jpg',
    descriptionEn: 'Events page hero image',
    descriptionEs: 'Imagen hero de la página Events',
    page: 'Events',
    section: 'Hero',
  },
  'events-register': {
    path: '/photo-new/photo_2026-04-20_13-45-00.jpg',
    descriptionEn: 'Events registration page hero',
    descriptionEs: 'Hero de la página de registro de eventos',
    page: 'Events Register',
    section: 'Hero',
  },
  'privacy-hero': {
    path: '/photo-new/photo_2026-04-20_13-45-06.jpg',
    descriptionEn: 'Privacy policy page hero image',
    descriptionEs: 'Imagen hero de la página de privacidad',
    page: 'Privacy',
    section: 'Hero',
  },
  'home-get-help': {
    path: '/photo-new/photo_2026-04-20_13-45-39.jpg',
    descriptionEn: 'Home Get Help CTA section image',
    descriptionEs: 'Imagen de la sección Get Help CTA en Home',
    page: 'Home',
    section: 'Get Help CTA',
  },
  'about-gallery-1': {
    path: '/photo-new/photo_2026-04-20_13-45-01.jpg',
    descriptionEn: 'About page gallery large image',
    descriptionEs: 'Imagen grande de la galería About',
    page: 'About',
    section: 'Gallery',
  },
  'about-gallery-2': {
    path: '/photo-new/photo_2026-04-20_13-46-33.jpg',
    descriptionEn: 'About page gallery image 2',
    descriptionEs: 'Imagen 2 de la galería About',
    page: 'About',
    section: 'Gallery',
  },
  'about-gallery-3': {
    path: '/photo-new/photo_2026-04-20_13-46-11.jpg',
    descriptionEn: 'About page gallery image 3',
    descriptionEs: 'Imagen 3 de la galería About',
    page: 'About',
    section: 'Gallery',
  },
  'about-gallery-4': {
    path: '/photo-new/photo_2026-04-20_13-49-46.jpg',
    descriptionEn: 'About page gallery image 4',
    descriptionEs: 'Imagen 4 de la galería About',
    page: 'About',
    section: 'Gallery',
  },
};

export function getSiteImageDefault(key: SiteImageKey): SiteImageDefault {
  return SITE_IMAGE_DEFAULTS[key];
}

export function getAllSiteImageKeys(): SiteImageKey[] {
  return Object.keys(SITE_IMAGE_DEFAULTS) as SiteImageKey[];
}
