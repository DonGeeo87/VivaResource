// Tipos de campos para formularios
export type FieldType = 
  | 'text'
  | 'email'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'number'
  | 'date'
  | 'phone';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  labelEs?: string;
  placeholder?: string;
  placeholderEs?: string;
  required: boolean;
  options?: { label: string; labelEs?: string; value: string }[]; // Para select, radio, checkbox
  description?: string;
  descriptionEs?: string;
}

export interface Form {
  id: string;
  title: string;
  titleEs?: string;
  description: string;
  descriptionEs?: string;
  fields: FormField[];
  eventId?: string; // Opcional: vincular a evento
  published: boolean;        // true = público, false = borrador
  linkedEventId?: string;    // ID del evento asociado (opcional)
  shareMode: 'link' | 'qr' | 'both';  // modo de compartir
  customSlug?: string;       // slug personalizado para URL
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Opcional: fecha de cierre
  settings: {
    allowMultipleSubmissions: boolean;
    showProgressBar: boolean;
    requireEmail: boolean;
    redirectUrl?: string;
    thankYouMessage?: string;
    thankYouMessageEs?: string;
  };
}

export interface FormSubmission {
  id: string;
  formId: string;
  responses: Record<string, string | string[]>; // fieldId -> value
  submittedAt: Date;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}
