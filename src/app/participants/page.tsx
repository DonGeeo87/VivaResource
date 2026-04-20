"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Filter, Download, Users } from "lucide-react";
import Link from "next/link";

interface Participant {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ciudad: string;
  taller: string;
  fuente: string;
}

export default function PublicParticipantsPage(): JSX.Element {
  const { language, isHydrated } = useLanguage();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTaller, setFilterTaller] = useState("all");
  const [filterFuente, setFilterFuente] = useState("all");

  const t = {
    title: language === "es" ? "Participantes" : "Participants",
    subtitle: language === "es" 
      ? "Directorio de participantes de talleres y eventos de Viva Resource" 
      : "Directory of Viva Resource workshop and event participants",
    search: language === "es" ? "Buscar por nombre o email..." : "Search by name or email...",
    filterTaller: language === "es" ? "Filtrar por taller" : "Filter by workshop",
    filterFuente: language === "es" ? "Filtrar por fuente" : "Filter by source",
    nombre: language === "es" ? "Nombre" : "Name",
    apellido: language === "es" ? "Apellido" : "Last Name",
    email: "Email",
    telefono: language === "es" ? "Teléfono" : "Phone",
    ciudad: language === "es" ? "Ciudad" : "City",
    taller: language === "es" ? "Taller/Evento" : "Workshop/Event",
    fuente: language === "es" ? "Fuente" : "Source",
    noData: language === "es" ? "Sin datos" : "No data",
    total: language === "es" ? "Total participantes" : "Total participants",
    exportData: language === "es" ? "Exportar CSV" : "Export CSV",
    all: language === "es" ? "Todos" : "All",
    adminLink: language === "es" ? "Acceso Admin" : "Admin Access",
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const q = query(collection(db, "participants"), orderBy("apellido"));
        const snapshot = await getDocs(q);
        const data: Participant[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Participant[];
        setParticipants(data);
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  const talleres = Array.from(
    new Set(participants.map((p) => p.taller).filter((t) => t && t !== "Información no disponible"))
  );
  const fuentes = Array.from(new Set(participants.map((p) => p.fuente).filter((f) => f)));

  const filtered = participants.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      `${p.nombre} ${p.apellido} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTaller = filterTaller === "all" || p.taller === filterTaller;
    const matchesFuente = filterFuente === "all" || p.fuente === filterFuente;
    return matchesSearch && matchesTaller && matchesFuente;
  });

  const handleExport = () => {
    const headers = ["Nombre", "Apellido", "Email", "Teléfono", "Ciudad", "Taller", "Fuente"];
    const csv = [
      headers.join(","),
      ...filtered.map((p) =>
        [p.nombre, p.apellido, p.email, p.telefono, p.ciudad, `"${p.taller}"`, p.fuente].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
  };

  if (!isHydrated) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
              <p className="text-primary-foreground/80">{t.subtitle}</p>
            </div>
            <Link
              href="/admin/login"
              className="text-sm text-white/80 hover:text-white underline"
            >
              {t.adminLink}
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              {t.exportData}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterTaller}
              onChange={(e) => setFilterTaller(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t.all} - {t.taller}</option>
              {talleres.map((taller) => (
                <option key={taller} value={taller}>
                  {taller.length > 50 ? taller.substring(0, 50) + "..." : taller}
                </option>
              ))}
            </select>

            <select
              value={filterFuente}
              onChange={(e) => setFilterFuente(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t.all} - {t.fuente}</option>
              {fuentes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          {t.total}: {filtered.length} / {participants.length}
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t.nombre}</th>
                <th className="px-4 py-3 text-left font-medium">{t.apellido}</th>
                <th className="px-4 py-3 text-left font-medium">{t.email}</th>
                <th className="px-4 py-3 text-left font-medium">{t.telefono}</th>
                <th className="px-4 py-3 text-left font-medium">{t.ciudad}</th>
                <th className="px-4 py-3 text-left font-medium">{t.taller}</th>
                <th className="px-4 py-3 text-left font-medium">{t.fuente}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>{language === "es" ? "No hay participantes" : "No participants found"}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id || i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3">{p.apellido}</td>
                    <td className="px-4 py-3">{p.email || t.noData}</td>
                    <td className="px-4 py-3">{p.telefono || t.noData}</td>
                    <td className="px-4 py-3">{p.ciudad || t.noData}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={p.taller || ""}>
                      {p.taller || t.noData}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.fuente || t.noData}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
