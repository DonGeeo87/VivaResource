export interface ImageUsage {
  location: string;
  page: string;
  descriptionEn: string;
  descriptionEs: string;
  path: string;
}

export type SiteImageKey =
  | 'hero-01'
  | 'hero-02'
  | 'hero-03'
  | 'home-get-help'
  | 'about-hero'
  | 'about-section'
  | 'about-gallery-1'
  | 'about-gallery-2'
  | 'about-gallery-3'
  | 'about-gallery-4'
  | 'pathway-food'
  | 'pathway-education'
  | 'pathway-community'
  | 'team-eva'
  | 'team-monserrat'
  | 'login-logo'
  | 'get-help-hero'
  | 'get-help-accent'
  | 'get-involved-hero'
  | 'get-involved-program'
  | 'donate-hero'
  | 'donate-card'
  | 'contact-hero'
  | 'contact-office'
  | 'contact-team'
  | 'events-hero'
  | 'events-register'
  | 'privacy-hero';

export interface SiteImage {
  key: SiteImageKey;
  path: string;
  url?: string;
  descriptionEn: string;
  descriptionEs: string;
  updatedAt: Date;
}
