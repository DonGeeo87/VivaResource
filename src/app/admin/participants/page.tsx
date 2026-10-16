"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, Upload, Plus, Loader2, Users } from "lucide-react";
import {
  PageShell,
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Modal,
  AdminButton,
  Toolbar,
  SearchInput,
  FilterSelect,
  Field,
  Input,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  TableEmpty,
  TableSkeleton,
} from "@/components/admin";

import { db, addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "@/lib/db-client";
import { getToken } from "@/lib/auth/client";

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
    saveSuccess: language === "es" ? "Contacto guardado" : "Contact saved",
    required: language === "es" ? "Completa nombre y apellido" : "Name and last name are required",
  };

  const fetchParticipants = async () => {
    try {
      const q = query(collection(db, "participants"), orderBy("apellido"));
      const snapshot = await getDocs(q);
      const data: Participant[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Participant[];
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
    new Set(participants.map((p) => p.taller).filter((tt) => tt && tt !== "Información no disponible"))
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
      ...filtered.map((p) => [p.nombre, p.apellido, p.email, p.telefono, p.ciudad, `"${p.taller}"`, p.fuente].join(",")),
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
      await addDoc(collection(db, "participants"), { ...newParticipant, createdAt: serverTimestamp() });
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
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
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

  const setField = (key: keyof Participant, value: string) =>
    setNewParticipant((prev) => ({ ...prev, [key]: value }));

  if (!isHydrated) {
    return <PageShell><TableSkeleton rows={3} cols={4} /></PageShell>;
  }

  return (
    <PageShell>
      <PageHeader
        title={t.title}
        description={`${t.total}: ${filtered.length} / ${participants.length}`}
        actions={
          <>
            <AdminButton variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={() => setShowImportModal(true)}>
              {t.importData}
            </AdminButton>
            <AdminButton variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
              {t.exportData}
            </AdminButton>
            <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              {t.addData}
            </AdminButton>
          </>
        }
      />

      <Card>
        <CardHeader title={t.title} icon={<Users className="w-4 h-4 text-primary" />} actions={<span className="text-xs text-on-surface-variant tabular-nums">{filtered.length}</span>} />
        <CardBody className="space-y-4">
          <Toolbar>
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder={t.search} />
            <FilterSelect value={filterTaller} onChange={setFilterTaller}>
              <option value="all">{t.all} - {t.taller}</option>
              {talleres.map((taller) => (
                <option key={taller} value={taller}>{taller.length > 50 ? taller.substring(0, 50) + "…" : taller}</option>
              ))}
            </FilterSelect>
            <FilterSelect value={filterFuente} onChange={setFilterFuente}>
              <option value="all">{t.all} - {t.fuente}</option>
              {fuentes.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </FilterSelect>
          </Toolbar>

          <div className="-mx-4 border-y border-outline-low">
            <Table>
              <Thead>
                <Th>{t.nombre}</Th>
                <Th>{t.apellido}</Th>
                <Th>{t.email}</Th>
                <Th>{t.telefono}</Th>
                <Th>{t.ciudad}</Th>
                <Th>{t.taller}</Th>
                <Th>{t.fuente}</Th>
              </Thead>
              <Tbody>
                {loading ? (
                  <TableSkeleton rows={5} cols={7} />
                ) : filtered.length === 0 ? (
                  <TableEmpty colSpan={7}>{language === "es" ? "No hay participantes" : "No participants found"}</TableEmpty>
                ) : (
                  filtered.map((p, i) => (
                    <Tr key={p.id || i}>
                      <Td><span className="font-medium text-on-surface">{p.nombre}</span></Td>
                      <Td>{p.apellido}</Td>
                      <Td>{p.email || t.noData}</Td>
                      <Td>{p.telefono || t.noData}</Td>
                      <Td>{p.ciudad || t.noData}</Td>
                      <Td className="max-w-[200px] truncate"><span title={p.taller || ""}>{p.taller || t.noData}</span></Td>
                      <Td>{p.fuente || t.noData}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t.addTitle}
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setShowAddModal(false)}>{t.cancel}</AdminButton>
            <AdminButton onClick={handleSave} disabled={saving} icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}>
              {t.save}
            </AdminButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.nombre} htmlFor="p-nombre" required>
            <Input id="p-nombre" value={newParticipant.nombre} onChange={(e) => setField("nombre", e.target.value)} />
          </Field>
          <Field label={t.apellido} htmlFor="p-apellido" required>
            <Input id="p-apellido" value={newParticipant.apellido} onChange={(e) => setField("apellido", e.target.value)} />
          </Field>
          <Field label={t.email} htmlFor="p-email">
            <Input id="p-email" type="email" value={newParticipant.email} onChange={(e) => setField("email", e.target.value)} />
          </Field>
          <Field label={t.telefono} htmlFor="p-telefono">
            <Input id="p-telefono" type="tel" value={newParticipant.telefono} onChange={(e) => setField("telefono", e.target.value)} />
          </Field>
          <Field label={t.ciudad} htmlFor="p-ciudad">
            <Input id="p-ciudad" value={newParticipant.ciudad} onChange={(e) => setField("ciudad", e.target.value)} placeholder="Información no disponible" />
          </Field>
          <Field label={t.taller} htmlFor="p-taller">
            <Input id="p-taller" value={newParticipant.taller} onChange={(e) => setField("taller", e.target.value)} placeholder="Información no disponible" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title={t.importTitle}
        footer={<AdminButton variant="secondary" onClick={() => setShowImportModal(false)}>{t.cancel}</AdminButton>}
      >
        <p className="text-sm text-on-surface-variant mb-4">
          {language === "es"
            ? "Selecciona un archivo Excel (.xlsx) con las columnas: Nombre, Apellido, Email, Teléfono, Ciudad, Taller"
            : "Select an Excel file (.xlsx) with columns: Name, Last Name, Email, Phone, City, Workshop"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImportExcel}
          className="w-full text-sm text-on-surface-variant file:mr-3 file:rounded-md file:border file:border-outline-low file:bg-surface-low file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-surface-high"
        />
        {importing && (
          <div className="flex items-center gap-2 justify-center py-4 text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t.importingFile}</span>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}
