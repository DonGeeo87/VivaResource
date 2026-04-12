export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: Date;
  source: 'website' | 'admin' | 'import';
}

export interface NewsletterHistory {
  id: string;
  subject: string;
  subjectEs?: string;
  body: string;
  bodyEs?: string;
  sentAt: Date;
  recipientCount: number;
  status: 'draft' | 'sent' | 'failed';
  sentBy: string; // admin email
}
