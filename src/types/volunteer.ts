// Tipos para el sistema de voluntarios

export type VolunteerStatus = "pending" | "approved" | "active" | "inactive" | "rejected";

export interface VolunteerUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoURL?: string;
  status: VolunteerStatus;
  registrationId?: string; // ID de la registración original
  joinedAt: Date;
  lastLoginAt?: Date;
  // Preferencias
  language: "en" | "es";
  notificationsEnabled: boolean;
  // Metadata
  unreadMessages: number;
  upcomingTasks: number;
}

export interface VolunteerTask {
  id: string;
  volunteerId: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  date: Date;
  startTime?: string; // "09:00"
  endTime?: string; // "12:00"
  location?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedBy: string; // UID del admin que asignó
  createdAt: Date;
  notes?: string;
}

export interface VolunteerMessage {
  id: string;
  volunteerId: string;
  from: string; // UID del admin o voluntario
  fromName: string;
  subject: string;
  subjectEs?: string;
  body: string;
  bodyEs?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  priority: "low" | "normal" | "high" | "urgent";
  // Reply fields
  isReply?: boolean;
  replyTo?: string; // ID del mensaje original al que responde
}

export interface VolunteerDashboardData {
  volunteer: VolunteerUser;
  tasks: VolunteerTask[];
  messages: VolunteerMessage[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    unreadMessages: number;
    hoursVolunteered: number;
    eventsAttended: number;
  };
}
