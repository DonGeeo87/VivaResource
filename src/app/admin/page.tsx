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
  getCountFromServer,
  db
} from "@/lib/db-client";
import {
  PageHeader,
  PageShell,
  StatCard,
  StatusBadge,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
} from "@/components/admin";

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
  surveyResponses: number;
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
    newsletterSubscribers: 0,
    surveyResponses: 0,
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

        const surveyQuery = query(collection(db, "survey_responses"));
        const surveySnap = await getCountFromServer(surveyQuery);

        setStats({
          blogPosts: blogSnap.data().count,
          events: eventsSnap.data().count,
          eventAttendees: registrationsSnap.data().count,
          forms: formsSnap.data().count,
          formSubmissions: submissionsSnap.data().count,
          volunteers: volunteersSnap.data().count,
          donations: donationsSnap.size,
          newsletterSubscribers: newsletterSnap.data().count,
          surveyResponses: surveySnap.data().count
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
          let eventName = eventCache[data?.event_id ?? ""];

          if (!eventName && data?.event_id) {
            try {
              const eventRef = collection(db, "events");
              const eventQuery = query(eventRef, where("__name__", "==", data.event_id));
              const eventSnap = await getDocs(eventQuery);
              if (!eventSnap.empty) {
                const eventData = eventSnap.docs[0].data();
                eventName = eventData?.title || eventData?.titleEs || "Evento";
                eventCache[data.event_id] = eventName;
              }
            } catch {
              eventName = "Evento";
            }
          }

          let createdAt: Date;
          try {
            if (data?.created_at && typeof data.created_at.toDate === "function") {
              createdAt = data.created_at.toDate();
            } else if (data?.created_at instanceof Date) {
              createdAt = data.created_at;
            } else if (typeof data?.created_at === "string") {
              createdAt = new Date(data.created_at);
            } else {
              createdAt = new Date();
            }
          } catch {
            createdAt = new Date();
          }

          registrations.push({
            id: doc.id,
            eventId: data?.event_id || "",
            eventName: eventName || "Evento",
            name: data?.name || data?.full_name || "Anónimo",
            email: data?.email || "",
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
          let formTitle = formCache[data?.formId ?? ""];

          if (!formTitle && data?.formId) {
            try {
              const formRef = collection(db, "forms");
              const formQuery = query(formRef, where("__name__", "==", data.formId));
              const formSnap = await getDocs(formQuery);
              if (!formSnap.empty) {
                const formData = formSnap.docs[0].data();
                formTitle = formData?.title || formData?.titleEs || "Formulario";
                formCache[data.formId] = formTitle;
              }
            } catch {
              formTitle = "Formulario";
            }
          }

          let submittedAt: Date;
          try {
            if (data?.submittedAt && typeof data.submittedAt.toDate === "function") {
              submittedAt = data.submittedAt.toDate();
            } else if (data?.submittedAt instanceof Date) {
              submittedAt = data.submittedAt;
            } else if (typeof data?.submittedAt === "string") {
              submittedAt = new Date(data.submittedAt);
            } else {
              submittedAt = new Date();
            }
          } catch {
            submittedAt = new Date();
          }

          submissions.push({
            id: doc.id,
            formId: data?.formId || "",
            formTitle: formTitle || "Formulario",
            email: data?.email || "",
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
            if (data?.created_at && typeof data.created_at.toDate === "function") {
              createdAt = data.created_at.toDate();
            } else if (data?.created_at instanceof Date) {
              createdAt = data.created_at;
            } else if (typeof data?.created_at === "string") {
              createdAt = new Date(data.created_at);
            } else {
              createdAt = new Date();
            }
          } catch {
            createdAt = new Date();
          }

          return {
            id: doc.id,
            name: data?.name || data?.full_name || "Anónimo",
            email: data?.email || "",
            status: data?.status || "pending",
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
            if (data?.date && typeof data.date.toDate === "function") {
              eventDate = data.date.toDate();
            } else if (data?.date instanceof Date) {
              eventDate = data.date;
            } else if (typeof data?.date === "string") {
              eventDate = new Date(data.date);
            }
          } catch {
            // If date parsing fails, leave as undefined
          }

          events.push({
            id: doc.id,
            title: data?.title_en || data?.title || "",
            titleEs: data?.title_es || "",
            status: data?.status || "published",
            attendeeCount: regSnap.data().count,
            capacity: data?.capacity || undefined,
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
              if (lastSubData?.submittedAt && typeof lastSubData.submittedAt.toDate === "function") {
                lastSubmission = lastSubData.submittedAt.toDate();
              } else if (lastSubData?.submittedAt instanceof Date) {
                lastSubmission = lastSubData.submittedAt;
              } else if (typeof lastSubData?.submittedAt === "string") {
                lastSubmission = new Date(lastSubData.submittedAt);
              }
            } catch {
              // If date parsing fails, leave as undefined
            }
          }

          forms.push({
            id: doc.id,
            title: data?.title || "",
            titleEs: data?.titleEs,
            status: data?.status || "draft",
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
    { title: language === "es" ? "Eventos Activos" : "Active Events", value: stats.events, icon: Calendar, href: "/admin/events" },
    { title: language === "es" ? "Asistentes a Eventos" : "Event Attendees", value: stats.eventAttendees, icon: Users, href: "/admin/events" },
    { title: language === "es" ? "Formularios Activos" : "Active Forms", value: stats.forms, icon: ClipboardList, href: "/admin/forms" },
    { title: language === "es" ? "Respuestas a Formularios" : "Form Responses", value: stats.formSubmissions, icon: MessageSquare, href: "/admin/forms" },
    { title: language === "es" ? "Voluntarios Registrados" : "Registered Volunteers", value: stats.volunteers, icon: Users, href: "/admin/volunteers" },
    { title: language === "es" ? "Donaciones" : "Donations", value: stats.donations, icon: Heart, href: "/admin/donations" },
    { title: "Blog Posts", value: stats.blogPosts, icon: FileText, href: "/admin/blog" },
    { title: language === "es" ? "Encuestas" : "Surveys", value: stats.surveyResponses, icon: ClipboardList, href: "/admin/surveys" },
    { title: language === "es" ? "Suscriptores Newsletter" : "Newsletter Subscribers", value: stats.newsletterSubscribers, icon: Mail, href: "/admin/newsletter" },
  ];

  const quickActions = [
    { href: "/admin/blog/new", icon: FileText, title: language === "es" ? "Crear Blog Post" : "Create Blog Post", desc: language === "es" ? "Escribir un nuevo artículo" : "Write a new article" },
    { href: "/admin/events/new", icon: Calendar, title: language === "es" ? "Crear Evento" : "Create Event", desc: language === "es" ? "Publicar un nuevo evento" : "Publish a new event" },
    { href: "/admin/volunteers", icon: Users, title: language === "es" ? "Revisar Voluntarios" : "Review Volunteers", desc: language === "es" ? "Gestionar solicitudes" : "Manage requests" },
  ];

  function formatDate(date: Date): string {
    const locale = language === "es" ? "es-ES" : "en-US";
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  const activityRows = (items: { id: string; primary: string; secondary: string; when: Date; href?: string }[]) =>
    items.map((item) => {
      const content = (
        <div className="flex items-center gap-3 py-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">{item.primary}</p>
            <p className="text-xs text-on-surface-variant truncate">{item.secondary}</p>
          </div>
          <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatDate(item.when)}</span>
        </div>
      );
      return item.href ? (
        <Link key={item.id} href={item.href} className="block hover:bg-surface-low -mx-2 px-2 rounded-md transition-colors">
          {content}
        </Link>
      ) : (
        <div key={item.id}>{content}</div>
      );
    });

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description={language === "es" ? "Bienvenido al panel de administración" : "Welcome to the admin panel"}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <StatCard
            key={card.title}
            label={card.title}
            value={card.value}
            icon={<card.icon className="w-5 h-5" />}
            href={card.href}
            loading={loading}
          />
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-4 p-4 bg-surface-lowest border border-outline-low rounded-lg hover:border-primary/30 hover:bg-surface-low transition-colors"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <action.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-on-surface">{action.title}</p>
              <p className="text-xs text-on-surface-variant truncate">{action.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-outline ml-auto group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader
            title={language === "es" ? "Registros a Eventos" : "Event Registrations"}
            icon={<Calendar className="w-4 h-4 text-primary" />}
            actions={
              <Link href="/admin/events" className="text-xs text-primary hover:underline flex items-center gap-1">
                {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <CardBody className="divide-y divide-outline-low">
            {loading ? (
              <div className="space-y-3 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-4 bg-surface-high rounded w-3/4 mb-2" />
                      <div className="h-3 bg-surface-high rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentRegistrations.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-6">
                {language === "es" ? "Sin registros recientes" : "No recent registrations"}
              </p>
            ) : (
              activityRows(recentRegistrations.map((reg) => ({
                id: reg.id,
                primary: reg.name,
                secondary: reg.eventName || "",
                when: reg.createdAt,
              })))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={language === "es" ? "Respuestas a Formularios" : "Form Responses"}
            icon={<MessageSquare className="w-4 h-4 text-primary" />}
            actions={
              <Link href="/admin/forms" className="text-xs text-primary hover:underline flex items-center gap-1">
                {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <CardBody className="divide-y divide-outline-low">
            {loading ? (
              <div className="space-y-3 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-surface-high rounded w-3/4 mb-2" />
                    <div className="h-3 bg-surface-high rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : recentSubmissions.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-6">
                {language === "es" ? "Sin respuestas recientes" : "No recent responses"}
              </p>
            ) : (
              activityRows(recentSubmissions.map((sub) => ({
                id: sub.id,
                primary: sub.formTitle || "",
                secondary: sub.email || (language === "es" ? "Sin email" : "No email"),
                when: sub.submittedAt,
              })))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={language === "es" ? "Nuevos Voluntarios" : "New Volunteers"}
            icon={<Heart className="w-4 h-4 text-primary" />}
            actions={
              <Link href="/admin/volunteers" className="text-xs text-primary hover:underline flex items-center gap-1">
                {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <CardBody className="divide-y divide-outline-low">
            {loading ? (
              <div className="space-y-3 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-surface-high rounded w-3/4 mb-2" />
                    <div className="h-3 bg-surface-high rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : recentVolunteers.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-6">
                {language === "es" ? "Sin voluntarios recientes" : "No recent volunteers"}
              </p>
            ) : (
              recentVolunteers.map((vol) => (
                <Link key={vol.id} href={`/admin/volunteers/${vol.id}`} className="flex items-center gap-3 py-2.5 hover:bg-surface-low -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{vol.name}</p>
                    <StatusBadge status={vol.status}>{vol.status}</StatusBadge>
                  </div>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">{formatDate(vol.createdAt)}</span>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {/* Métricas por evento */}
      <Card>
        <CardHeader
          title={language === "es" ? "Métricas por Evento" : "Event Metrics"}
          icon={<BarChart3 className="w-4 h-4 text-primary" />}
          actions={
            <Link href="/admin/events" className="text-xs text-primary hover:underline flex items-center gap-1">
              {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardBody>
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-surface-high rounded w-1/3 mb-2" />
                  <div className="h-3 bg-surface-high rounded w-full" />
                </div>
              ))}
            </div>
          ) : eventMetrics.length === 0 ? (
            <p className="text-on-surface-variant text-center py-8">
              {language === "es" ? "No hay eventos publicados" : "No published events"}
            </p>
          ) : (
            <div className="space-y-4">
              {eventMetrics.map((event) => {
                const capacity = event.capacity || 100;
                const percentage = Math.min((event.attendeeCount / capacity) * 100, 100);
                return (
                  <Link key={event.id} href={`/admin/events/${event.id}`} className="block group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                            {language === "es" && event.titleEs ? event.titleEs : event.title}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {event.attendeeCount} {event.attendeeCount === 1 ? (language === "es" ? "asistente" : "attendee") : (language === "es" ? "asistentes" : "attendees")}
                            {event.capacity && ` ${language === "es" ? "de" : "of"} ${event.capacity}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-on-surface tabular-nums">{Math.round(percentage)}%</span>
                        <Eye className="w-4 h-4 text-outline" />
                      </div>
                    </div>
                    <div className="w-full bg-surface-high rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${percentage >= 80 ? "bg-red-500" : percentage >= 50 ? "bg-secondary" : "bg-primary"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Métricas por formulario */}
      <Card>
        <CardHeader
          title={language === "es" ? "Métricas por Formulario" : "Form Metrics"}
          icon={<ClipboardList className="w-4 h-4 text-primary" />}
          actions={
            <Link href="/admin/forms" className="text-xs text-primary hover:underline flex items-center gap-1">
              {language === "es" ? "Ver todos" : "View all"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        {formMetrics.length === 0 && !loading ? (
          <CardBody>
            <p className="text-on-surface-variant text-center py-8">
              {language === "es" ? "No hay formularios publicados" : "No published forms"}
            </p>
          </CardBody>
        ) : (
          <Table>
            <Thead>
              <Th>{language === "es" ? "Formulario" : "Form"}</Th>
              <Th align="center">{language === "es" ? "Estado" : "Status"}</Th>
              <Th align="center">{language === "es" ? "Respuestas" : "Responses"}</Th>
              <Th align="right">{language === "es" ? "Última respuesta" : "Last response"}</Th>
              <Th align="right">{language === "es" ? "Acciones" : "Actions"}</Th>
            </Thead>
            <Tbody>
              {loading ? (
                [0, 1, 2].map((i) => (
                  <Tr key={i}>
                    <Td><div className="h-4 bg-surface-high rounded w-40 animate-pulse" /></Td>
                    <Td><div className="h-4 bg-surface-high rounded w-16 mx-auto animate-pulse" /></Td>
                    <Td><div className="h-4 bg-surface-high rounded w-8 mx-auto animate-pulse" /></Td>
                    <Td><div className="h-4 bg-surface-high rounded w-24 ml-auto animate-pulse" /></Td>
                    <Td><div className="h-4 bg-surface-high rounded w-24 ml-auto animate-pulse" /></Td>
                  </Tr>
                ))
              ) : (
                formMetrics.map((form) => (
                  <Tr key={form.id}>
                    <Td><span className="font-medium text-on-surface">{form.title || form.titleEs}</span></Td>
                    <Td align="center"><StatusBadge status={form.status}>{form.status}</StatusBadge></Td>
                    <Td align="center"><span className="tabular-nums font-medium text-on-surface">{form.submissionCount}</span></Td>
                    <Td align="right">{form.lastSubmission ? formatDate(form.lastSubmission) : (language === "es" ? "Sin respuestas" : "No responses")}</Td>
                    <Td align="right">
                      <Link href={`/admin/forms/${form.id}/responses`} className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
                        {language === "es" ? "Ver respuestas" : "View responses"} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Card>
    </PageShell>
  );
}
