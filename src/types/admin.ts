export type AdminRole = 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface SiteSettings {
  siteName: string;
  siteNameEs?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  addressEs?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  paypalEnabled: boolean;
  paypalMode?: 'sandbox' | 'live';
  donationSettings: {
    suggestedAmounts: number[];
    customAmountEnabled: boolean;
    monthlyDonationEnabled: boolean;
  };
  notificationSettings: {
    notifyOnEventRegistration: boolean;
    notifyOnVolunteerSignup: boolean;
    notifyOnFormSubmission: boolean;
  };
  updatedAt: Date;
}
