export interface BlogPost {
  id: string;
  title: string;
  titleEs?: string;
  slug: string;
  excerpt: string;
  excerptEs?: string;
  content: string;
  contentEs?: string;
  image?: string;
  category: string;
  language: 'en' | 'es';
  status: 'draft' | 'published' | 'archived';
  author?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type BlogFormData = Omit<BlogPost, 'id' | 'publishedAt' | 'createdAt' | 'updatedAt'>;
