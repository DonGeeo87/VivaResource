"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { BarChart3, Users, PieChart, MessageSquare } from "lucide-react";
import {
  PageShell,
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmpty,
  TableSkeleton,
} from "@/components/admin";

import { db, collection, getCountFromServer, getDocs, limit, orderBy, query } from "@/lib/db-client";

interface SurveyResponse {
  id: string;
  interests: string[];
  interests_other?: string;
  barriers: string[];
  barriers_other?: string;
  channels: string[];
  preferred_time: string;
  needs_childcare: string;
  wants_contact: boolean;
  contact_method: string;
  contact_value: string;
  comments: string;
  submittedAt: Date | { toDate(): Date };
  language: string;
}

interface SurveyStats {
  total: number;
  interestCounts: Record<string, number>;
  barrierCounts: Record<string, number>;
  channelCounts: Record<string, number>;
  timeCounts: Record<string, number>;
  childcareCounts: Record<string, number>;
  wantsContact: number;
}

const LABELS: Record<string, { en: string; es: string }> = {
  job_training: { en: "Job Training", es: "Capacitación Laboral" },
  health_wellness: { en: "Health & Wellness", es: "Salud y Bienestar" },
  education: { en: "Education", es: "Educación" },
  immigration: { en: "Immigration Help", es: "Ayuda Migratoria" },
  financial: { en: "Financial Literacy", es: "Educación Financiera" },
  housing: { en: "Housing Assistance", es: "Asistencia Vivienda" },
  food: { en: "Food Distribution", es: "Distribución Alimentos" },
  childcare: { en: "Childcare", es: "Cuidado Infantil" },
  language: { en: "ESL Classes", es: "Clases de Inglés" },
  digital: { en: "Digital Skills", es: "Habilidades Digitales" },
  other: { en: "Other", es: "Otro" },
  time: { en: "No time/Conflicts", es: "Falta de tiempo" },
  location: { en: "Too far", es: "Muy lejos" },
  transport: { en: "No transport", es: "Sin transporte" },
  cost: { en: "Too expensive", es: "Muy caro" },
  awareness: { en: "Didn't know", es: "No sabía" },
  interest: { en: "Not interested", es: "No me interesa" },
  email: { en: "Email", es: "Correo" },
  whatsapp: { en: "WhatsApp/Text", es: "WhatsApp" },
  facebook: { en: "Facebook", es: "Facebook" },
  instagram: { en: "Instagram", es: "Instagram" },
  website: { en: "Website", es: "Sitio Web" },
  flyer: { en: "Flyers", es: "Volantes" },
  word_of_mouth: { en: "Word of Mouth", es: "Boca a boca" },
  morning: { en: "Mornings (9-12)", es: "Mañanas (9-12)" },
  afternoon: { en: "Afternoons (12-5)", es: "Tardes (12-5)" },
  evening: { en: "Evenings (5-8)", es: "Noches (5-8)" },
  weekend: { en: "Weekends", es: "Fines de Semana" },
  flexible: { en: "Flexible", es: "Flexible" },
  yes: { en: "Needs childcare", es: "Necesita cuidado" },
  no: { en: "Doesn't need", es: "No necesita" },
  maybe: { en: "Maybe", es: "Tal vez" },
};

function countBy(arr: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  arr.forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
  });
  return counts;
}

function BarChart({ data, label }: { data: Record<string, number>; label: (k: string) => string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return <p className="text-on-surface-variant text-sm py-4">—</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1 gap-3">
            <span className="text-on-surface-variant truncate">{label(key)}</span>
            <span className="font-semibold text-on-surface tabular-nums">{value}</span>
          </div>
          <div className="w-full bg-surface-high rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${(value / maxVal) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminSurveysPage() {
  const { language } = useLanguage();
  const isES = language === "es";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SurveyStats>({
    total: 0,
    interestCounts: {},
    barrierCounts: {},
    channelCounts: {},
    timeCounts: {},
    childcareCounts: {},
    wantsContact: 0,
  });
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const countSnap = await getCountFromServer(collection(db, "survey_responses"));
        const totalCount = countSnap.data().count;
        const q = query(collection(db, "survey_responses"), orderBy("submittedAt", "desc"), limit(50));
        const snap = await getDocs(q);

        const allInterests: string[] = [];
        const allBarriers: string[] = [];
        const allChannels: string[] = [];
        const allTimes: string[] = [];
        const allChildcare: string[] = [];
        let contactCount = 0;
        const items: SurveyResponse[] = [];

        snap.docs.forEach((d) => {
          const data = d.data() as Omit<SurveyResponse, "id">;
          items.push({ id: d.id, ...data });
          if (data.interests) {
            allInterests.push(...data.interests);
            if (data.interests_other) allInterests.push("other:" + data.interests_other);
          }
          if (data.barriers) {
            allBarriers.push(...data.barriers);
            if (data.barriers_other) allBarriers.push("other:" + data.barriers_other);
          }
          if (data.channels) allChannels.push(...data.channels);
          if (data.preferred_time) allTimes.push(data.preferred_time);
          if (data.needs_childcare) allChildcare.push(data.needs_childcare);
          if (data.wants_contact) contactCount++;
        });

        setStats({
          total: totalCount,
          interestCounts: countBy(allInterests),
          barrierCounts: countBy(allBarriers),
          channelCounts: countBy(allChannels),
          timeCounts: countBy(allTimes),
          childcareCounts: countBy(allChildcare),
          wantsContact: contactCount,
        });
        setResponses(items);
      } catch (error) {
        console.error("Error fetching survey data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const label = (key: string) => {
    const cleanKey = key.startsWith("other:") ? "other" : key;
    const l = LABELS[cleanKey];
    return l ? (isES ? l.es : l.en) : cleanKey;
  };

  const displayedResponses = showAll ? responses : responses.slice(0, 10);

  const charts = [
    { title: isES ? "Intereses Principales" : "Top Interests", data: stats.interestCounts },
    { title: isES ? "Barreras Principales" : "Top Barriers", data: stats.barrierCounts },
    { title: isES ? "Canales Preferidos" : "Preferred Channels", data: stats.channelCounts },
    { title: isES ? "Horarios Preferidos" : "Preferred Times", data: stats.timeCounts },
    { title: isES ? "Necesidad de Cuidado Infantil" : "Childcare Needs", data: stats.childcareCounts },
  ];

  return (
    <PageShell>
      <PageHeader
        title={isES ? "Encuestas" : "Surveys"}
        description={isES ? "Respuestas de Voz Comunitaria" : "Community Voice responses"}
        actions={
          <Link
            href="/survey"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            {isES ? "Ver Encuesta" : "View Survey"}
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label={isES ? "Respuestas Totales" : "Total Responses"} value={stats.total} icon={<Users className="w-5 h-5" />} loading={loading} />
        <StatCard label={isES ? "Quieren ser contactados" : "Want to be contacted"} value={stats.wantsContact} icon={<MessageSquare className="w-5 h-5" />} tone="success" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.map((chart) => (
          <Card key={chart.title}>
            <CardHeader title={chart.title} icon={<PieChart className="w-4 h-4 text-primary" />} />
            <CardBody>
              <BarChart data={chart.data} label={label} />
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title={isES ? "Respuestas Individuales" : "Individual Responses"}
          actions={
            responses.length > 10 ? (
              <button onClick={() => setShowAll(!showAll)} className="text-xs text-primary hover:underline font-medium">
                {showAll ? (isES ? "Mostrar menos" : "Show less") : (isES ? `Ver todas (${responses.length})` : `View all (${responses.length})`)}
              </button>
            ) : undefined
          }
        />
        <Table>
          <Thead>
            <Th>{isES ? "Fecha" : "Date"}</Th>
            <Th>{isES ? "Intereses" : "Interests"}</Th>
            <Th>{isES ? "Barreras" : "Barriers"}</Th>
            <Th>{isES ? "Contacto" : "Contact"}</Th>
            <Th>{isES ? "Comentarios" : "Comments"}</Th>
          </Thead>
          <Tbody>
            {loading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : displayedResponses.length === 0 ? (
              <TableEmpty colSpan={5}>
                {isES ? "No hay respuestas todavía. Comparte la encuesta para empezar." : "No responses yet. Share the survey to get started."}
              </TableEmpty>
            ) : (
              displayedResponses.map((r) => (
                <Tr key={r.id}>
                  <Td className="whitespace-nowrap">
                    {(r.submittedAt as { toDate?: () => Date })?.toDate
                      ? (r.submittedAt as { toDate: () => Date }).toDate().toLocaleDateString(isES ? "es-ES" : "en-US")
                      : "—"}
                  </Td>
                  <Td className="max-w-[200px] truncate">
                    {r.interests?.slice(0, 3).map((i) => label(i)).join(", ") || "—"}
                    {r.interests?.length > 3 ? "…" : ""}
                  </Td>
                  <Td className="max-w-[200px] truncate">{r.barriers?.slice(0, 2).map((b) => label(b)).join(", ") || "—"}</Td>
                  <Td>{r.wants_contact ? <span className="text-emerald-600 font-medium">{r.contact_value || (isES ? "Sí" : "Yes")}</span> : <span className="text-outline">—</span>}</Td>
                  <Td className="max-w-[200px] truncate">{r.comments || "—"}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </PageShell>
  );
}
