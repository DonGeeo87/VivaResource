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
    path: '/photo-bank/hero_01.jpg',
    descriptionEn: 'Hero section main image (desktop top-right circle)',
    descriptionEs: 'Imagen principal del hero (círculo superior derecho escritorio)',
    page: 'Home',
    section: 'Hero',
  },
  'hero-02': {
    path: '/photo-bank/hero_02.jpg',
    descriptionEn: 'Hero section bottom-left rounded image',
    descriptionEs: 'Imagen inferior izquierda del hero',
    page: 'Home',
    section: 'Hero',
  },
  'hero-03': {
    path: '/photo-bank/hero_03.jpg',
    descriptionEn: 'Hero section middle rotated image',
    descriptionEs: 'Imagen rotada del centro del hero',
    page: 'Home',
    section: 'Hero',
  },
  'about-hero': {
    path: '/photo-bank/hero_01.jpg',
    descriptionEn: 'About page hero image',
    descriptionEs: 'Imagen hero de la página About',
    page: 'About',
    section: 'Hero',
  },
  'about-section': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhlNFXpKXPoBIbturq16XhOwCpjyU-T1q50kVxHVp0M9SYVHp7MAfkoZ734QoU4tmWYdOPHoKWhSMpjU3yd764-H4E_RY5vnTAhUgnjVrKV1w5m7ZjAf943B-cPKtUKEoG8Ga8oqHhcvvc9_h1BSYtmhVbP72mDZoemX5rGzaPn6j5g47ozYRzAzSqiasHOjchDqXv9KpYwP0eMH1JuFE2FnuJPtzmOYBo5UjhyAMckBZIMu6DxzzY6wLv-03nmvBQaITHgdazuN0',
    descriptionEn: 'Home About section parallax image',
    descriptionEs: 'Imagen parallax de la sección About en Home',
    page: 'Home',
    section: 'About VIVA',
  },
  'get-help-hero': {
    path: 'https://images.unsplash.com/photo-1559027615-cd4628902d42?w=1920&q=80',
    descriptionEn: 'Get Help page hero background',
    descriptionEs: 'Fondo hero de la página Get Help',
    page: 'Get Help',
    section: 'Hero',
  },
  'get-involved-hero': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkHH-eYSUuv5Ascsub3aRhJZ-4Q_WRY0N3sv6qce3afa3TTZE0DXGifxvViubqZPWG066hDP0wQvMT2SgcJwCxPnECENaEiSMvVzmeDCVMDTqkimbEh2hrZOcNQbfkxHkp7feuv6RjiHvWWtACu-si-c2QSpa58R7BliyKZFQ4eTINTWuoxGdGG__S4wVG0swBV15C7gnQuS-MluUafNZg7lcmozm5YNb0QzsMgY3VW7r0jzIBwMBMogLu4VyY3nfJS1a-POR15sg',
    descriptionEn: 'Get Involved page hero image',
    descriptionEs: 'Imagen hero de la página Get Involved',
    page: 'Get Involved',
    section: 'Hero',
  },
  'get-involved-program': {
    path: '/photo-bank/vivaresource (10).jpg',
    descriptionEn: 'Ambassador program card image',
    descriptionEs: 'Imagen de tarjeta del programa embajadores',
    page: 'Get Involved',
    section: 'Programs',
  },
  'pathway-food': {
    path: '/photo-bank/vivaresource (5).jpg',
    descriptionEn: 'Pathway 01 - Food & Wellness',
    descriptionEs: 'Camino 01 - Alimentación y Bienestar',
    page: 'Home',
    section: 'Pathways',
  },
  'pathway-education': {
    path: '/photo-bank/vivaresource (6).jpg',
    descriptionEn: 'Pathway 02 - Education & Training',
    descriptionEs: 'Camino 02 - Educación y Capacitación',
    page: 'Home',
    section: 'Pathways',
  },
  'pathway-community': {
    path: '/photo-bank/vivaresource (8).jpg',
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
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnZEXadlEb8zoAW2EYMtwdF_swwjJgygOgqgwBFI2WN4zWE1wQvoRGkzyXE-XM4chB6R9oiYyyPmEYWQeGJoLNbWo59tc_N6KnCyWDE6ANfylinJsjYFCp5eyRri5uMeeSOz5JBCGYi6Ya8walmRAxHxFi4H79stqiZsPn6FXMVC1-jJODNI03OfHVhJA9lF50YArIoNAkt0GxoJ94HMs6sjzWquId-t_5wIvqbi1rZh6ZiiapVyMI5Sc_iY8CovxxYPqgETVRU5U',
    descriptionEn: 'Donate page hero image',
    descriptionEs: 'Imagen hero de la página Donate',
    page: 'Donate',
    section: 'Hero',
  },
  'donate-card': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvuH0wH7x2E_yjDdqx7VCF-NcTPVesWtSRrCB8m5oM6HI8UJFM_OEJZv9m4x42zZzuGCyOiKAgpCHmN44XHmljk6sf5pVsfgXa2aXXUezWhPfkvbtdlic3IbgVfAyormFPy4TkC4tFu0KvlmPHoTA63MhnusVqtOCgJbkfQPOWJ8ZZrC6CWqSkYt2JU6mk-FPQ8sgWy0wAWdbPH5ukLqUMq1IdpU9n1Zb23Toy-w5lZ_HI3Eo9CYcr8WjCasmasscBKMP3N2Y2nAA',
    descriptionEn: 'Donate page impact card image',
    descriptionEs: 'Imagen de tarjeta de impacto en Donate',
    page: 'Donate',
    section: 'Impact',
  },
  'contact-hero': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxCNb4SWpP96lkuuFhuEnA9E7dVEzO6wPHzX_ie08ZbcdIjk8XcZai-h8kqInbsdaYsduMlsw3sTXvCvyhK-et0S3TEyeqTxTQBOlGFAz5As1NSW4jws_gbZyg27wtId-hh8bPnNaue00TP1KTRJRwmaR-kNcicCQZFPJlBZ3OdehCGsTFX78uRBmMsyRMPPzW332yrXCmC5z0KQiEK4RBVqVzDeRDbsCbMQb-juD9ZKW1gDKCAhYqcZAB86yrEtpv0s8SK3nHCbk',
    descriptionEn: 'Contact page hero image',
    descriptionEs: 'Imagen hero de la página Contact',
    page: 'Contact',
    section: 'Hero',
  },
  'contact-office': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAzCOBQuv1yhE66tIdXYzNFzNuFVhlm_fAMRt4ip7ucMiaDLG_YBaWJ59khL13TtGMmZHntG6N9FJgPei6M9uN8YR1qQceRljQKc-ImiJiklorVIwS_dtkj6rmFaDT28GAhpxVno2VbLrdNWc4LO8-rNA7VchKhGXUd8-2Hh_k2EAtVKyPfJIvFxeL51OTjawXMt3gETYQ73EDJ--43e1fdCV9m1GHSsXH1w4_b8m7C-6iNXHpM69SAGuTXrQw_b_zpdwZLyGMd6Q',
    descriptionEn: 'Contact page office photo',
    descriptionEs: 'Foto de oficina en Contact',
    page: 'Contact',
    section: 'Office',
  },
  'contact-team': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVyIZ_NfMf9B1clV2U9YwyMtecK12_5MvyCiKBLmVrQhHtP-W2WUqeap3xF9VBGvthdZ_9lRsGzpuSLz0U8_EYao05UoeIVyjfUzO-xj2Qtg9xXM-SyL5hfIP6tVZL3EyVUnF8KC86q2f73DeUvFiRX1u7p_6AhZ9eSeLfJ2baoMFsJeSejoQAACVx-p5xU2KDBnEhDSQnhvMxHX-aFNfBo_HfFjud-QVXrSkFS76wG7z8fFJjcVHz1yOa5LUIZRKjTvyodWoqLvk',
    descriptionEn: 'Contact page team photo',
    descriptionEs: 'Foto del equipo en Contact',
    page: 'Contact',
    section: 'Team',
  },
  'get-help-accent': {
    path: '/photo-bank/vivaresource (15).jpg',
    descriptionEn: 'Get Help sidebar accent image',
    descriptionEs: 'Imagen de acento en barra lateral de Get Help',
    page: 'Get Help',
    section: 'Sidebar',
  },
  'events-hero': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDviyMaJX02LZ9Ba55WlNjs85RirUbGfuvJTNuJra4dxuGVv8ax834dQy9wy2draDRL3BRjBJAYpIcWoybX_Ff2ghIhZuFfmmZaVSJd88SrhwUPlrAHAwwzXRds1IwO3kE5vo6D1Z6SPPmjwwJChjxbeQDqIucv2mbK7aTulSZBkzjYHHT1YKQ-A_7COiBglupwTPy8J63IN-yAYnTNJ0ZLLmOOiT-ZN4liJpTr8hOzja-I73xe-pBoByAtgzlu0nPPenyYkKiE9bA',
    descriptionEn: 'Events page hero image',
    descriptionEs: 'Imagen hero de la página Events',
    page: 'Events',
    section: 'Hero',
  },
  'events-register': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD3WzpAJgsApG7ISMaQZY3gRsI6-MpHz_sAqXCVedBaCH5jhmp20vsB03E3G7GSol80b7XG3K4_6DgjbT2afaWLZfrwDZBSG3p2dnshGcLOlqIWZskwk1Oo_o3H3I4RTe2Naub4H4BCsacR0yGLCYmPhoWIjShQZBAeVpJIr_dPFCIZzcgirTqUDHg4HTPV0bRzamp3BPL6aZweuNdDIq9quQ4Na-1_B0CN-E0MGDN_RUN4RYGuW7ynxGi_OIANppvBiBUbrwTDxM',
    descriptionEn: 'Events registration page hero',
    descriptionEs: 'Hero de la página de registro de eventos',
    page: 'Events Register',
    section: 'Hero',
  },
  'privacy-hero': {
    path: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2XPGM5MojMsPUlBiUsGKtUp3BN42FCcTbJDYhN000WXHdr5lGV5J6ylTZpfCG5OdU0yJcGaaxLSjEe7LosipRnVSU6aRm7gRPi-EwHJeIT6HxbWW81UyrDsiNy9xBHtBTdjSS23ZVEt8bZ0Y4Ur4uFmRxM8ou27DCoSyT54U8XTSSAMmIMmRpSloRCBESZLMNMw4wEkb8xKDlLAD-XfH3ec7uMvHJk4oS1FuDzE_h_JukfiHwBTknTG58I2n4jI2i07kvNNlnJQc',
    descriptionEn: 'Privacy policy page hero image',
    descriptionEs: 'Imagen hero de la página de privacidad',
    page: 'Privacy',
    section: 'Hero',
  },
  'home-get-help': {
    path: '/photo-bank/vivaresource (10).jpg',
    descriptionEn: 'Home Get Help CTA section image',
    descriptionEs: 'Imagen de la sección Get Help CTA en Home',
    page: 'Home',
    section: 'Get Help CTA',
  },
  'about-gallery-1': {
    path: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    descriptionEn: 'About page gallery large image',
    descriptionEs: 'Imagen grande de la galería About',
    page: 'About',
    section: 'Gallery',
  },
  'about-gallery-2': {
    path: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80',
    descriptionEn: 'About page gallery image 2',
    descriptionEs: 'Imagen 2 de la galería About',
    page: 'About',
    section: 'Gallery',
  },
  'about-gallery-3': {
    path: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=400&q=80',
    descriptionEn: 'About page gallery image 3',
    descriptionEs: 'Imagen 3 de la galería About',
    page: 'About',
    section: 'Gallery',
  },
  'about-gallery-4': {
    path: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80',
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
