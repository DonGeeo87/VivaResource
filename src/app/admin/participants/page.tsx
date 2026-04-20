"use client";

import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Filter, Download, User, Upload, Plus, X, Save, Loader2 } from "lucide-react";

interface Participant {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ciudad: string;
  taller: string;
  fuente: string;
  createdAt?: unknown;
}

const defaultValues: Participant = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  ciudad: "Información no disponible",
  taller: "Información no disponible",
  fuente: "Agregado manualmente",
};

export default function ParticipantsPage(): JSX.Element {
  const { language, isHydrated } = useLanguage();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTaller, setFilterTaller] = useState("all");
  const [filterFuente, setFilterFuente] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newParticipant, setNewParticipant] = useState<Participant>(defaultValues);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    title: language === "es" ? "Participantes" : "Participants",
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
    importData: language === "es" ? "Importar Excel" : "Import Excel",
    exportData: language === "es" ? "Exportar CSV" : "Export CSV",
    addData: language === "es" ? "Agregar Contacto" : "Add Contact",
    all: language === "es" ? "Todos" : "All",
    addTitle: language === "es" ? "Agregar Nuevo Participante" : "Add New Participant",
    importTitle: language === "es" ? "Importar desde Excel" : "Import from Excel",
    cancel: language === "es" ? "Cancelar" : "Cancel",
    save: language === "es" ? "Guardar" : "Save",
    importingFile: language === "es" ? "Importando..." : "Importing...",
    importSuccess: language === "es" ? "Importado successfully" : "Import completed successfully",
    selectFile: language === "es" ? "Seleccionar archivo Excel" : "Select Excel file",
    saveSuccess: language === "es" ? "Contacto guardado" : "Contact saved",
    required: language === "es" ? " Campo requerido" : "Required field",
  };

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

  useEffect(() => {
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

  const handleSave = async () => {
    if (!newParticipant.nombre.trim() || !newParticipant.apellido.trim()) {
      alert(t.required);
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "participants"), {
        ...newParticipant,
        createdAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewParticipant(defaultValues);
      await fetchParticipants();
    } catch (error) {
      console.error("Error saving participant:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/participants/import", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchParticipants();
        setShowImportModal(false);
      }
    } catch (error) {
      console.error("Error importing:", error);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isHydrated) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" />
            {t.importData}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            {t.addData}
          </button>
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
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.addTitle}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.nombre} *</label>
                <input
                  type="text"
                  value={newParticipant.nombre}
                  onChange={(e) => setNewParticipant({ ...newParticipant, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.apellido} *</label>
                <input
                  type="text"
                  value={newParticipant.apellido}
                  onChange={(e) => setNewParticipant({ ...newParticipant, apellido: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.email}</label>
                <input
                  type="email"
                  value={newParticipant.email}
                  onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.telefono}</label>
                <input
                  type="tel"
                  value={newParticipant.telefono}
                  onChange={(e) => setNewParticipant({ ...newParticipant, telefono: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.ciudad}</label>
                <input
                  type="text"
                  value={newParticipant.ciudad}
                  onChange={(e) => setNewParticipant({ ...newParticipant, ciudad: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Información no disponible"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.taller}</label>
                <input
                  type="text"
                  value={newParticipant.taller}
                  onChange={(e) => setNewParticipant({ ...newParticipant, taller: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Información no disponible"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.importTitle}</h2>
              <button onClick={() => setShowImportModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              {language === "es"
                ? "Selecciona un archivo Excel (.xlsx) con las columnas: Nombre, Apellido, Email, Teléfono, Ciudad, Taller"
                : "Select an Excel file (.xlsx) with columns: Name, Last Name, Email, Phone, City, Workshop"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            {importing && (
              <div className="flex items-center gap-2 justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.importingFile}</span>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}