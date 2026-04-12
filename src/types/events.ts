export interface Event {
  id: string;
  title: string;
  titleEs?: string;
  slug: string;
  description: string;
  descriptionEs?: string;
  date: Date;
  endDate?: Date;
  location: string;
  locationEs?: string;
  image?: string;
  category: 'workshop' | 'community' | 'fundraiser' | 'webinar' | 'other';
  status: 'draft' | 'published' | 'cancelled';
  requiresRegistration: boolean;
  maxAttendees?: number;
  currentAttendees?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type EventFormData = Omit<Event, 'id' | 'currentAttendees' | 'createdAt' | 'updatedAt'>;

export interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  registeredAt: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}
