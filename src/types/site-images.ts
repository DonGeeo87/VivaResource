export interface ImageUsage {
  location: string;
  page: string;
  descriptionEn: string;
  descriptionEs: string;
  path: string;
}

export type SiteImageKey = 'hero-01' | 'hero-02' | 'hero-03' | 'team-eva' | 'team-monserrat' | 'pathway-food' | 'pathway-education' | 'pathway-community' | 'login-logo';

export interface SiteImage {
  key: SiteImageKey;
  path: string;
  url?: string;
  descriptionEn: string;
  descriptionEs: string;
  updatedAt: Date;
}
