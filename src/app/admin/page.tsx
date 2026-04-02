"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FileText,
  Calendar,
  Users,
  ArrowRight,
  ClipboardList,
  MessageSquare,
  Heart,
  Mail,
  Eye,
  BarChart3
} from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Interfaces
interface Stats {
  blogPosts: number;
  events: number;
  eventAttendees: number;
  forms: number;
  formSubmissions: number;
  volunteers: number;
  donations: number;
  newsletterSubscribers: number;
}

interface RecentEventRegistration {
  id: string;
  eventId: string;
  eventName?: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface RecentFormSubmission {
  id: string;
  formId: string;
  formTitle?: string;
  email?: string;
  submittedAt: Date;
}

interface RecentVolunteer {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
}

interface EventMetric {
  id: string;
  title: string;
  titleEs?: string;
  status: string;
  attendeeCount: number;
  capacity?: number;
  date?: Date;
}

interface FormMetric {
  id: string;
  title: string;
  titleEs?: string;
  status: string;
  submissionCount: number;
  lastSubmission?: Date;
}

export default function AdminDashboard(): JSX.Element {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    blogPosts: 0,
    events: 0,
    eventAttendees: 0,
    forms: 0,
    formSubmissions: 0,
    volunteers: 0,
    donations: 0,
    newsletterSubscribers: 0
  });
  const [loading, setLoading] = useState(true);

  const [recentRegistrations, setRecentRegistrations] = useState<RecentEventRegistration[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentFormSubmission[]>([]);
  const [recentVolunteers, setRecentVolunteers] = useState<RecentVolunteer[]>([]);

  const [eventMetrics, setEventMetrics] = useState<EventMetric[]>([]);
  const [formMetrics, setFormMetrics] = useState<FormMetric[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const blogQuery = query(collection(db, "blog_posts"), where("status", "==", "published"));
        const blogSnap = await getCountFromServer(blogQuery);

        const eventsQuery = query(collection(db, "events"), where("status", "==", "published"));
        const eventsSnap = await getCountFromServer(eventsQuery);

        const volunteersQuery = query(collection(db, "volunteer_registrations"));
        const volunteersSnap = await getCountFromServer(volunteersQuery);

        const formsQuery = query(collection(db, "forms"), where("status", "==", "published"));
        const formsSnap = await getCountFromServer(formsQuery);

        const newsletterQuery = query(collection(db, "newsletter_subscribers"));
        const newsletterSnap = await getCountFromServer(newsletterQuery);

        const registrationsQuery = query(collection(db, "event_registrations"));
        const registrationsSnap = await getCountFromServer(registrationsQuery);

        const submissionsQuery = query(collection(db, "form_submissions"));
        const submissionsSnap = await getCountFromServer(submissionsQuery);

        const donationsSnap = await getDocs(collection(db, "donations"));

        setStats({
          blogPosts: blogSnap.data().count,
          events: eventsSnap.data().count,
          eventAttendees: registrationsSnap.data().count,
          forms: formsSnap.data().count,
          formSubmissions: submissionsSnap.data().count,
          volunteers: volunteersSnap.data().count,
          donations: donationsSnap.size,
          newsletterSubscribers: newsletterSnap.data().count
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchRecentActivity() {
      try {
        const regQuery = query(
          collection(db, "event_registrations"),
          orderBy("created_at", "desc"),
          limit(5)
        );
        const regSnap = await getDocs(regQuery);
        const registrations: RecentEventRegistration[] = [];

        const eventCache: Record<string, string> = {};

        for (const doc of regSnap.docs) {
          const data = doc.data();
          let eventName = eventCache[data.event_id];

          if (!eventName && data.event_id) {
            try {
              const eventRef = collection(db, "events");
              const eventQuery = query(eventRef, where("__name__", "==", data.event_id));
              const eventSnap = await getDocs(eventQuery);
              if (!eventSnap.empty) {
                const eventData = eventSnap.docs[0].data();
                eventName = eventData.title || eventData.titleEs || "Evento";
                eventCache[data.event_id] = eventName;
              }
            } catch {
              eventName = "Evento";
            }
          }

          let createdAt: Date;
          try {
            if (data.created_at && typeof data.created_at.toDate === "function") {
              createdAt = data.created_at.toDate();
            } else if (data.created_at instanceof Date) {
              createdAt = data.created_at;
            } else if (typeof data.created_at === "string") {
              createdAt = new Date(data.created_at);
            } else {
              createdAt = new Date();
            }
          } catch {
            createdAt = new Date();
          }

          registrations.push({
            id: doc.id,
            eventId: data.event_id || "",
            eventName: eventName || "Evento",
            name: data.name || data.full_name || "Anónimo",
            email: data.email || "",
            createdAt
          });
        }
        setRecentRegistrations(registrations);

        const subQuery = query(
          collection(db, "form_submissions"),
          orderBy("submittedAt", "desc"),
          limit(5)
        );
        const subSnap = await getDocs(subQuery);
        const submissions: RecentFormSubmission[] = [];

        const formCache: Record<string, string> = {};

        for (const doc of subSnap.docs) {
          const data = doc.data();
          let formTitle = formCache[data.formId];

          if (!formTitle && data.formId) {
            try {
              const formRef = collection(db, "forms");
              const formQuery = query(formRef, where("__name__", "==", data.formId));
              const formSnap = await getDocs(formQuery);
              if (!formSnap.empty) {
                const formData = formSnap.docs[0].data();
                formTitle = formData.title || formData.titleEs || "Formulario";
                formCache[data.formId] = formTitle;
              }
            } catch {
              formTitle = "Formulario";
            }
          }

          let submittedAt: Date;
          try {
            if (data.submittedAt && typeof data.submittedAt.toDate === "function") {
              submittedAt = data.submittedAt.toDate();
            } else if (data.submittedAt instanceof Date) {
              submittedAt = data.submittedAt;
            } else if (typeof data.submittedAt === "string") {
              submittedAt = new Date(data.submittedAt);
            } else {
              submittedAt = new Date();
            }
          } catch {
            submittedAt = new Date();
          }

          submissions.push({
            id: doc.id,
            formId: data.formId || "",
            formTitle: formTitle || "Formulario",
            email: data.email || "",
            submittedAt
          });
        }
        setRecentSubmissions(submissions);

        const volQuery = query(
          collection(db, "volunteer_registrations"),
          orderBy("created_at", "desc"),
          limit(5)
        );
        const volSnap = await getDocs(volQuery);
        const volunteers: RecentVolunteer[] = volSnap.docs.map((doc) => {
          const data = doc.data();
          
          let createdAt: Date;
          try {
            if (data.created_at && typeof data.created_at.toDate === "function") {
              createdAt = data.created_at.toDate();
            } else if (data.created_at instanceof Date) {
              createdAt = data.created_at;
            } else if (typeof data.created_at === "string") {
              createdAt = new Date(data.created_at);
            } else {
              createdAt = new Date();
            }
          } catch {
            createdAt = new Date();
          }

          return {
            id: doc.id,
            name: data.name || data.full_name || "Anónimo",
            email: data.email || "",
            status: data.status || "pending",
            createdAt
          };
        });
        setRecentVolunteers(volunteers);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      }
    }

    async function fetchEventMetrics() {
      try {
        const eventsQuery = query(
          collection(db, "events"),
          where("status", "==", "published"),
          limit(10)
        );
        const eventsSnap = await getDocs(eventsQuery);
        const events: EventMetric[] = [];

        for (const doc of eventsSnap.docs) {
          const data = doc.data();

          const regQuery = query(
            collection(db, "event_registrations"),
            where("event_id", "==", doc.id)
          );
          const regSnap = await getCountFromServer(regQuery);

          let eventDate: Date | undefined;
          try {
            if (data.date && typeof data.date.toDate === "function") {
              eventDate = data.date.toDate();
            } else if (data.date instanceof Date) {
              eventDate = data.date;
            } else if (typeof data.date === "string") {
              eventDate = new Date(data.date);
            }
          } catch {
            // If date parsing fails, leave as undefined
          }

          events.push({
            id: doc.id,
            title: data.title_en || data.title || "",
            titleEs: data.title_es || "",
            status: data.status || "published",
            attendeeCount: regSnap.data().count,
            capacity: data.capacity || undefined,
            date: eventDate
          });
        }

        events.sort((a, b) => b.attendeeCount - a.attendeeCount);
        setEventMetrics(events);
      } catch (error) {
        console.error("Error fetching event metrics:", error);
      }
    }

    async function fetchFormMetrics() {
      try {
        const formsQuery = query(
          collection(db, "forms"),
          where("status", "in", ["published", "closed"]),
          limit(10)
        );
        const formsSnap = await getDocs(formsQuery);
        const forms: FormMetric[] = [];

        for (const doc of formsSnap.docs) {
          const data = doc.data();

          const subQuery = query(
            collection(db, "form_submissions"),
            where("formId", "==", doc.id)
          );
          const subSnap = await getCountFromServer(subQuery);

          const lastSubQuery = query(
            collection(db, "form_submissions"),
            where("formId", "==", doc.id),
            orderBy("submittedAt", "desc"),
            limit(1)
          );
          const lastSubSnap = await getDocs(lastSubQuery);
          let lastSubmission: Date | undefined;
          if (!lastSubSnap.empty) {
            const lastSubData = lastSubSnap.docs[0].data();
            try {
              if (lastSubData.submittedAt && typeof lastSubData.submittedAt.toDate === "function") {
                lastSubmission = lastSubData.submittedAt.toDate();
              } else if (lastSubData.submittedAt instanceof Date) {
                lastSubmission = lastSubData.submittedAt;
              } else if (typeof lastSubData.submittedAt === "string") {
                lastSubmission = new Date(lastSubData.submittedAt);
              }
            } catch {
              // If date parsing fails, leave as undefined
            }
          }

          forms.push({
            id: doc.id,
            title: data.title || "",
            titleEs: data.titleEs,
            status: data.status || "draft",
            submissionCount: subSnap.data().count,
            lastSubmission
          });
        }

        forms.sort((a, b) => b.submissionCount - a.submissionCount);
        setFormMetrics(forms);
      } catch (error) {
        console.error("Error fetching form metrics:", error);
      }
    }

    async function fetchData() {
      await Promise.all([
        fetchStats(),
        fetchRecentActivity(),
        fetchEventMetrics(),
        fetchFormMetrics()
      ]);
    }

    fetchData();
  }, []);

  const kpiCards = [
    {
      title: language === "es" ? "Eventos Activos" : "Active Events",
      value: stats.events,
      icon: Calendar,
      href: "/admin/events",
      color: "bg-blue-500"
    },
    {
      title: language === "es" ? "Asistentes a Eventos" : "Event Attendees",
      value: stats.eventAttendees,
      icon: Users,
      href: "/admin/events",
      color: "bg-indigo-500"
    },
    {
      title: language === "es" ? "Formularios Activos" : "Active Forms",
      value: stats.forms,
      icon: ClipboardList,
      href: "/admin/forms",
      color: "bg-emerald-500"
    },
    {
      title: language === "es" ? "Respuestas a Formularios" : "Form Responses",
      value: stats.formSubmissions,
      icon: MessageSquare,
      href: "/admin/forms",
      color: "bg-teal-500"
    },
    {
      title: language === "es" ? "Voluntarios Registrados" : "Registered Volunteers",
      value: stats.volunteers,
      icon: Users,
      href: "/admin/volunteers",
      color: "bg-orange-500"
    },
    {
      title: language === "es" ? "Donaciones" : "Donations",
      value: stats.donations,
      icon: Heart,
      href: "/admin/donations",
      color: "bg-rose-500"
    },
    {
      title: language === "es" ? "Suscriptores Newsletter" : "Newsletter Subscribers",
      value: stats.newsletterSubscribers,
      icon: Mail,
      href: "/admin/newsletter",
      color: "bg-purple-500"
    },
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      icon: FileText,
      href: "/admin/blog",
      color: "bg-cyan-500"
    }
  ];

  function formatDate(date: Date): string {
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getStatusBadge(status: string): JSX.Element {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      published: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      draft: "bg-gray-100 text-gray-800"
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant mt-1">{language === "es" ? "Bienvenido al panel de administración" : "Welcome to the admin panel"}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-low hover:shadow-ambient-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-on-surface-variant" />
            </div>
            <p className="text-3xl font-bold text-on-surface">
              {loading ? "..." : card.value}
            </p>
            <p className="text-on-surface-variant text-sm mt-1">{card.title}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/blog/new"
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <FileText className="w-8 h-8 mb-4" />
          <h3 className="font-semibold text-lg">{language === "es" ? "Crear Blog Post" : "Create Blog Post"}</h3>
          <p className="text-blue-100 text-sm mt-1">{language === "es" ? "Escribir un nuevo artículo" : "Write a new article"}</p>
        </Link>

        <Link
          href="/admin/events/new"
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all"
        >
          <Calendar className="w-8 h-8 mb-4" />
          <h3 className="font-semibold text-lg">{language === "es" ? "Crear Evento" : "Create Event"}</h3>
          <p className="text-green-100 text-sm mt-1">{language === "es" ? "Publicar un nuevo evento" : "Publish a new event"}</p>
        </Link>

        <Link
          href="/admin/volunteers"
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <Users className="w-8 h-8 mb-4" />
          <h3 className="font-semibold text-lg">{language === "es" ? "Revisar Voluntarios" : "Review Volunteers"}</h3>
          <p className="text-orange-100 text-sm mt-1">{language === "es" ? "Gestionar solicitudes" : "Manage requests"}</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Event Registrations */}
        <div className="bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-low">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              {language === "es" ? "Registros a Eventos" : "Event Registrations"}
            </h2>
            <Link href="/admin/events" className="text-sm text-primary hover:underline flex items-center gap-1">
              {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-surface-low rounded-lg">
                  <div className="w-10 h-10 bg-surface-high rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-surface-high rounded w-3/4 mb-2" />
                    <div className="h-3 bg-surface-high rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : recentRegistrations.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-4">{language === "es" ? "Sin registros recientes" : "No recent registrations"}</p>
            ) : (
              recentRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-3 p-3 bg-surface-low rounded-lg hover:bg-surface-high transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{reg.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{reg.eventName}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatDate(reg.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Form Submissions */}
        <div className="bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-low">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              {language === "es" ? "Respuestas a Formularios" : "Form Responses"}
            </h2>
            <Link href="/admin/forms" className="text-sm text-primary hover:underline flex items-center gap-1">
              {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-surface-low rounded-lg">
                  <div className="w-10 h-10 bg-surface-high rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-surface-high rounded w-3/4 mb-2" />
                    <div className="h-3 bg-surface-high rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : recentSubmissions.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-4">{language === "es" ? "Sin respuestas recientes" : "No recent responses"}</p>
            ) : (
              recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-3 bg-surface-low rounded-lg hover:bg-surface-high transition-colors">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{sub.formTitle}</p>
                    <p className="text-xs text-on-surface-variant truncate">{sub.email || (language === "es" ? "Sin email" : "No email")}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatDate(sub.submittedAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Volunteers */}
        <div className="bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-low">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2">
              <Heart className="w-5 h-5 text-orange-500" />
              {language === "es" ? "Nuevos Voluntarios" : "New Volunteers"}
            </h2>
            <Link href="/admin/volunteers" className="text-sm text-primary hover:underline flex items-center gap-1">
              {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-surface-low rounded-lg">
                  <div className="w-10 h-10 bg-surface-high rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-surface-high rounded w-3/4 mb-2" />
                    <div className="h-3 bg-surface-high rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : recentVolunteers.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-4">{language === "es" ? "Sin voluntarios recientes" : "No recent volunteers"}</p>
            ) : (
              recentVolunteers.map((vol) => (
                <Link
                  key={vol.id}
                  href={`/admin/volunteers/${vol.id}`}
                  className="flex items-center gap-3 p-3 bg-surface-low rounded-lg hover:bg-surface-high transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{vol.name}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(vol.status)}
                    </div>
                  </div>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatDate(vol.createdAt)}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Event Metrics */}
      <div className="bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-low mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            {language === "es" ? "Métricas por Evento" : "Event Metrics"}
          </h2>
          <Link href="/admin/events" className="text-sm text-primary hover:underline flex items-center gap-1">
            {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-surface-high rounded w-1/3 mb-2" />
                <div className="h-3 bg-surface-high rounded w-full" />
              </div>
            ))}
          </div>
        ) : eventMetrics.length === 0 ? (
          <p className="text-on-surface-variant text-center py-8">{language === "es" ? "No hay eventos publicados" : "No published events"}</p>
        ) : (
          <div className="space-y-4">
            {eventMetrics.map((event) => {
              const capacity = event.capacity || 100;
              const percentage = Math.min((event.attendeeCount / capacity) * 100, 100);
              return (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="block p-4 bg-surface-low rounded-lg hover:bg-surface-high transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-on-surface">{event.title}</p>
                        <p className="text-sm text-on-surface-variant">
                          {event.attendeeCount} {event.attendeeCount === 1 ? (language === "es" ? "asistente" : "attendee") : (language === "es" ? "asistentes" : "attendees")}
                          {event.capacity && ` ${language === "es" ? "de" : "of"} ${event.capacity} ${language === "es" ? "disponibles" : "available"}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-on-surface">{Math.round(percentage)}%</span>
                      <Eye className="w-4 h-4 text-on-surface-variant" />
                    </div>
                  </div>
                  <div className="w-full bg-surface-high rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage >= 80 ? "bg-red-500" : percentage >= 50 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Metrics */}
      <div className="bg-surface-lowest rounded-xl p-6 shadow-ambient border border-outline-low mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-500" />
            {language === "es" ? "Métricas por Formulario" : "Form Metrics"}
          </h2>
          <Link href="/admin/forms" className="text-sm text-primary hover:underline flex items-center gap-1">
            {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-surface-low rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-surface-high rounded w-1/3 mb-2" />
                  <div className="h-3 bg-surface-high rounded w-1/4" />
                </div>
                <div className="h-8 bg-surface-high rounded w-24" />
              </div>
            ))}
          </div>
        ) : formMetrics.length === 0 ? (
          <p className="text-on-surface-variant text-center py-8">{language === "es" ? "No hay formularios publicados" : "No published forms"}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-low">
                  <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">{language === "es" ? "Formulario" : "Form"}</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-on-surface-variant">{language === "es" ? "Estado" : "Status"}</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-on-surface-variant">{language === "es" ? "Respuestas" : "Responses"}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-on-surface-variant">{language === "es" ? "Última respuesta" : "Last response"}</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-on-surface-variant">{language === "es" ? "Acciones" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {formMetrics.map((form) => (
                  <tr key={form.id} className="border-b border-outline-low hover:bg-surface-low">
                    <td className="py-3 px-4">
                      <p className="font-medium text-on-surface">{form.title || form.titleEs}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(form.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full font-medium text-sm">
                        {form.submissionCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-on-surface-variant">
                      {form.lastSubmission ? formatDate(form.lastSubmission) : (language === "es" ? "Sin respuestas" : "No responses")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/forms/${form.id}/responses`}
                        className="text-sm text-primary hover:underline flex items-center justify-end gap-1"
                      >
                        {language === "es" ? "Ver respuestas" : "View responses"} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
