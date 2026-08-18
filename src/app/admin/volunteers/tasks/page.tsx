"use client";

import { useEffect, useState } from "react";
import { db, addDoc, collection, doc, getDocs, query, updateDoc, orderBy } from "@/lib/db-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminButton, PageHeader, Pagination, EmptyState } from "@/components/admin";
import { Calendar, MapPin, Clock, Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";

interface VolunteerUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface Task {
  id: string;
  volunteerId: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  status: string;
  notes?: string;
}

export default function AdminVolunteerTasksPage(): JSX.Element {
  const { language } = useLanguage();
  const isES = language === "es";

  const [volunteers, setVolunteers] = useState<VolunteerUser[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Form state
  const [form, setForm] = useState({
    volunteerId: "",
    title: "",
    titleEs: "",
    description: "",
    descriptionEs: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });

  const fetchData = async () => {
    try {
      // Fetch approved volunteers (users)
      const usersSnap = await getDocs(query(collection(db, "volunteer_users"), orderBy("firstName", "asc")));
      const users = usersSnap.docs.map((d: any) => ({ uid: d.id, ...d.data() })) as VolunteerUser[];
      setVolunteers(users);

      // Fetch all tasks
      const tasksSnap = await getDocs(query(collection(db, "volunteer_tasks"), orderBy("date", "desc")));
      const taskList = tasksSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as Task[];
      setTasks(taskList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const volunteerName = (uid: string): string => {
    const v = volunteers.find(v => v.uid === uid);
    return v ? `${v.firstName} ${v.lastName}` : uid;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.volunteerId || !form.title || !form.date) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "volunteer_tasks"), {
        volunteerId: form.volunteerId,
        title: form.title,
        titleEs: form.titleEs || form.title,
        description: form.description,
        descriptionEs: form.descriptionEs || form.description,
        date: new Date(form.date + "T12:00:00"),
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
        status: "pending",
        createdAt: new Date(),
      });
      setForm({
        volunteerId: "", title: "", titleEs: "", description: "", descriptionEs: "",
        date: "", startTime: "", endTime: "", location: "", notes: "",
      });
      setShowForm(false);
      await fetchData();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isES ? "¿Eliminar esta tarea?" : "Delete this task?")) return;
    try {
      await updateDoc(doc(db, "volunteer_tasks", id), { status: "cancelled" });
      await fetchData();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const formatDate = (date: string | Date): string => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString(isES ? "es-ES" : "en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const filteredTasks = tasks.filter(t => t.status !== "cancelled");
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTasks = filteredTasks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const statusLabels: Record<string, string> = {
    pending: isES ? "Pendiente" : "Pending",
    in_progress: isES ? "En progreso" : "In Progress",
    completed: isES ? "Completada" : "Completed",
    cancelled: isES ? "Cancelada" : "Cancelled",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary";

  return (
    <div>
      <PageHeader
        title={isES ? "Tareas de Voluntarios" : "Volunteer Tasks"}
        description={isES ? "Crea y asigna tareas a los voluntarios" : "Create and assign tasks to volunteers"}
        actions={
          <AdminButton size="md" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
            {isES ? "Nueva Tarea" : "New Task"}
          </AdminButton>
        }
      />

      {/* Create Task Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {isES ? "Asignar nueva tarea" : "Assign new task"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isES ? "Voluntario *" : "Volunteer *"}
              </label>
              <select
                required
                value={form.volunteerId}
                onChange={(e) => setForm({ ...form, volunteerId: e.target.value })}
                className={inputCls}
              >
                <option value="">{isES ? "Selecciona un voluntario..." : "Select a volunteer..."}</option>
                {volunteers.map(v => (
                  <option key={v.uid} value={v.uid}>
                    {v.firstName} {v.lastName} ({v.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isES ? "Título (EN) *" : "Title (EN) *"}
              </label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isES ? "Título (ES)" : "Title (ES)"}
              </label>
              <input value={form.titleEs} onChange={(e) => setForm({ ...form, titleEs: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isES ? "Descripción (EN)" : "Description (EN)"}
              </label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isES ? "Descripción (ES)" : "Description (ES)"}
              </label>
              <textarea value={form.descriptionEs} onChange={(e) => setForm({ ...form, descriptionEs: e.target.value })} rows={2} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isES ? "Fecha *" : "Date *"}
              </label>
              <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isES ? "Inicio" : "Start"}</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isES ? "Fin" : "End"}</label>
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isES ? "Ubicación" : "Location"}</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{isES ? "Notas" : "Notes"}</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <AdminButton type="submit" disabled={saving} icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}>
              {saving ? (isES ? "Guardando..." : "Saving...") : (isES ? "Crear tarea" : "Create task")}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowForm(false)}>
              {isES ? "Cancelar" : "Cancel"}
            </AdminButton>
          </div>
        </form>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 h-24" />
          ))}
        </div>
      ) : paginatedTasks.length === 0 ? (
        <EmptyState
          title={isES ? "No hay tareas" : "No tasks yet"}
          description={isES
            ? "Crea la primera tarea para asignarla a un voluntario"
            : "Create the first task to assign it to a volunteer"}
        />
      ) : (
        <div className="space-y-4">
          {paginatedTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {isES && task.titleEs ? task.titleEs : task.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status] || "bg-gray-100"}`}>
                      {statusLabels[task.status] || task.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary mb-1">
                    {isES ? "Voluntario:" : "Volunteer:"} {volunteerName(task.volunteerId)}
                  </p>
                  {(task.description || task.descriptionEs) && (
                    <p className="text-sm text-gray-600 mb-2">
                      {isES && task.descriptionEs ? task.descriptionEs : task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(task.date)}</span>
                    {task.startTime && (
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{task.startTime}{task.endTime ? ` - ${task.endTime}` : ""}</span>
                    )}
                    {task.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{task.location}</span>
                    )}
                  </div>
                </div>
                <AdminButton
                  variant="ghost"
                  icon={<Trash2 className="w-4 h-4 text-red-600" />}
                  onClick={() => handleDelete(task.id)}
                  title={isES ? "Eliminar tarea" : "Delete task"}
                />
              </div>
            </div>
          ))}

          {/* Pagination */}
          {filteredTasks.length > PAGE_SIZE && (
            <div className="pt-4 flex justify-center">
              <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
