"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AdminAuthContext";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CheckCircle, Clock, XCircle, Calendar, Mail, Phone } from "lucide-react";

interface VolunteerApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  skills: string[];
  interests: string[];
  availability: string;
  experience: string;
  status: string;
  created_at: Timestamp | Date;
}

export default function VolunteerPortalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
      return;
    }

    if (user?.email) {
      fetchApplications(user.email);
    }
  }, [user, authLoading, router]);

  const fetchApplications = async (email: string) => {
    try {
      const q = query(
        collection(db, "volunteer_registrations"),
        where("email", "==", email),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VolunteerApplication[];
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold">Portal de Voluntarios</h1>
          <p className="text-primary-100 mt-2">Bienvenido, {user?.email}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No tienes solicitudes registradas
            </h2>
            <p className="text-gray-600 mb-8">
              ¿Te gustaría convertirte en voluntario? Envía tu solicitud.
            </p>
            <a
              href="/get-involved"
              className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-hover transition-colors"
            >
              Enviar Solicitud
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tus Solicitudes
            </h2>

            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(app.status)}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {app.program === "ambassador"
                          ? "Programa de Embajadores"
                          : app.program === "volunteer"
                          ? "Programa de Voluntariado"
                          : "Consulta General"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {app.created_at instanceof Timestamp
                          ? app.created_at.toDate().toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })
                          : new Date(app.created_at).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    app.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : app.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {getStatusText(app.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Información Personal</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <strong>Nombre:</strong> {app.firstName} {app.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {app.email}
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {app.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {app.skills && app.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Habilidades</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.interests && app.interests.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Intereses</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.interests.map((interest, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Disponibilidad</h4>
                    <p className="text-sm text-gray-600">{app.availability || "No especificada"}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Experiencia</h4>
                    <p className="text-sm text-gray-600">{app.experience || "No especificada"}</p>
                  </div>
                </div>

                {app.status === "approved" && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ¡Tu solicitud ha sido aprobada! Nos pondremos en contacto contigo pronto para coordinar tu participación.
                    </p>
                  </div>
                )}

                {app.status === "pending" && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      Tu solicitud está siendo revisada. Te contactaremos dentro de 48 horas.
                    </p>
                  </div>
                )}

                {app.status === "rejected" && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      Tu solicitud no ha sido aprobada en esta ocasión. Gracias por tu interés.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
