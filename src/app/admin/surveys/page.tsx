"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { BarChart3, Users, PieChart, MessageSquare } from "lucide-react";

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
  // Interests
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
  // Barriers
  time: { en: "No time/Conflicts", es: "Falta de tiempo" },
  location: { en: "Too far", es: "Muy lejos" },
  transport: { en: "No transport", es: "Sin transporte" },
  cost: { en: "Too expensive", es: "Muy caro" },
  awareness: { en: "Didn't know", es: "No sabía" },
  interest: { en: "Not interested", es: "No me interesa" },
  // Channels
  email: { en: "Email", es: "Correo" },
  whatsapp: { en: "WhatsApp/Text", es: "WhatsApp" },
  facebook: { en: "Facebook", es: "Facebook" },
  instagram: { en: "Instagram", es: "Instagram" },
  website: { en: "Website", es: "Sitio Web" },
  flyer: { en: "Flyers", es: "Volantes" },
  word_of_mouth: { en: "Word of Mouth", es: "Boca a boca" },
  // Times
  morning: { en: "Mornings (9-12)", es: "Mañanas (9-12)" },
  afternoon: { en: "Afternoons (12-5)", es: "Tardes (12-5)" },
  evening: { en: "Evenings (5-8)", es: "Noches (5-8)" },
  weekend: { en: "Weekends", es: "Fines de Semana" },
  flexible: { en: "Flexible", es: "Flexible" },
  // Childcare
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
    return <p className="text-gray-400 text-sm py-4">No data yet</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 truncate">{label(key)}</span>
            <span className="font-bold text-gray-900">{value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${(value / maxVal) * 100}%` }}
            />
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

        snap.docs.forEach((doc) => {
          const data = doc.data() as Omit<SurveyResponse, "id">;
          const item: SurveyResponse = { id: doc.id, ...data };

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

          items.push(item);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayedResponses = showAll ? responses : responses.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isES ? "Encuestas" : "Surveys"}
          </h1>
          <p className="text-gray-500">
            {isES ? "Respuestas de Voz Comunitaria" : "Community Voice responses"}
          </p>
        </div>
        <Link
          href="/survey"
          target="_blank"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          {isES ? "Ver Encuesta" : "View Survey"}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Responses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">
                {isES ? "Respuestas Totales" : "Total Responses"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.wantsContact}</p>
              <p className="text-sm text-gray-500">
                {isES ? "Quieren ser contactados" : "Want to be contacted"}
              </p>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            {isES ? "Intereses Principales" : "Top Interests"}
          </h3>
          <BarChart data={stats.interestCounts} label={label} />
        </div>

        {/* Barriers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            {isES ? "Barreras Principales" : "Top Barriers"}
          </h3>
          <BarChart data={stats.barrierCounts} label={label} />
        </div>

        {/* Channels */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-500" />
            {isES ? "Canales Preferidos" : "Preferred Channels"}
          </h3>
          <BarChart data={stats.channelCounts} label={label} />
        </div>

        {/* Preferred Time */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">
            {isES ? "Horarios Preferidos" : "Preferred Times"}
          </h3>
          <BarChart data={stats.timeCounts} label={label} />
        </div>

        {/* Childcare */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">
            {isES ? "Necesidad de Cuidado Infantil" : "Childcare Needs"}
          </h3>
          <BarChart data={stats.childcareCounts} label={label} />
        </div>
      </div>

      {/* Individual Responses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            {isES ? "Respuestas Individuales" : "Individual Responses"}
          </h3>
          {responses.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {showAll
                ? isES ? "Mostrar menos" : "Show less"
                : isES
                  ? `Ver todas (${responses.length})`
                  : `View all (${responses.length})`}
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  {isES ? "Intereses" : "Interests"}
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  {isES ? "Barreras" : "Barriers"}
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  {isES ? "Contacto" : "Contact"}
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  {isES ? "Comentarios" : "Comments"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedResponses.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {(r.submittedAt as { toDate?: () => Date })?.toDate
                      ? (r.submittedAt as { toDate: () => Date }).toDate().toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {r.interests?.slice(0, 3).map((i) => label(i)).join(", ") || "—"}
                    {r.interests?.length > 3 ? "..." : ""}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {r.barriers?.slice(0, 2).map((b) => label(b)).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.wants_contact ? (
                      <span className="text-green-600 font-medium">
                        {r.contact_value || "Yes"}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-gray-500">
                    {r.comments || "—"}
                  </td>
                </tr>
              ))}
              {displayedResponses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    {isES
                      ? "No hay respuestas todavía. Comparte la encuesta para empezar."
                      : "No responses yet. Share the survey to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}