"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AdminAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Calendar, Mail, Phone } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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
  const { language, translations } = useLanguage();
  const t = translations.volunteerPortal;

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return t.statusApproved;
      case "pending":
        return t.statusPending;
      case "rejected":
        return t.statusRejected;
      default:
        return status;
    }
  };

  const getProgramText = (program: string) => {
    switch (program) {
      case "ambassador":
        return t.programAmbassador;
      case "volunteer":
        return t.programVolunteer;
      default:
        return t.programGeneral;
    }
  };

  const formatDate = (date: Timestamp | Date) => {
    const dateObj = date instanceof Timestamp ? date.toDate() : new Date(date);
    const locale = language === "es" ? "es-ES" : "en-US";
    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (authLoading || loading) {
    return (
      <LoadingSpinner size="lg" text={t.loading} fullScreen />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-primary-100 mt-2">{t.welcome}, {user?.email}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {applications.length === 0 ? (
          <Card className="text-center" padding="lg">
            <div className="py-4">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t.noApplications}
              </h2>
              <p className="text-gray-600 mb-8">
                {t.noApplicationsDesc}
              </p>
              <a
                href="/get-involved"
                className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-hover transition-colors"
              >
                {t.submitApplication}
              </a>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t.yourApplications}
            </h2>

            {applications.map((app) => (
              <Card key={app.id} padding="lg">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {getProgramText(app.program)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(app.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      app.status === "approved"
                        ? "success"
                        : app.status === "pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {getStatusText(app.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">{t.personalInfo}</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <strong>{t.name}:</strong> {app.firstName} {app.lastName}
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
                      <h4 className="font-semibold text-gray-700 mb-2">{t.skills}</h4>
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
                      <h4 className="font-semibold text-gray-700 mb-2">{t.interests}</h4>
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
                    <h4 className="font-semibold text-gray-700 mb-2">{t.availability}</h4>
                    <p className="text-sm text-gray-600">{app.availability || t.notSpecified}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">{t.experience}</h4>
                    <p className="text-sm text-gray-600">{app.experience || t.notSpecified}</p>
                  </div>
                </div>

                {app.status === "approved" && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      {t.approvedMessage}
                    </p>
                  </div>
                )}

                {app.status === "pending" && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      {t.pendingMessage}
                    </p>
                  </div>
                )}

                {app.status === "rejected" && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      {t.rejectedMessage}
                    </p>
                  </div>
                )}
            </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
