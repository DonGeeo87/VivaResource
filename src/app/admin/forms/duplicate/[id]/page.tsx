"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

export default function DuplicateFormPage(): JSX.Element {
  const { id } = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const duplicateForm = async (): Promise<void> => {
      try {
        const formRef = doc(db, "forms", id as string);
        const formSnap = await getDoc(formRef);

        if (!formSnap.exists()) {
          setError(language === "es" ? "Formulario no encontrado" : "Form not found");
          return;
        }

        const formData = formSnap.data();
        const copySuffix = language === "es" ? " (Copia)" : " (Copy)";

        const newFormData = {
          ...formData,
          title: `${formData.title}${copySuffix}`,
          titleEs: formData.titleEs ? `${formData.titleEs} (Copia)` : undefined,
          status: "draft" as const,
          published: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "forms"), newFormData);
        router.push(`/admin/forms/${docRef.id}`);
      } catch (err: unknown) {
        console.error("Error duplicating form:", err);
        setError(language === "es" ? "Error al duplicar el formulario" : "Error duplicating form");
      }
    };

    if (id) {
      duplicateForm();
    }
  }, [id, router, language]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/admin/forms")}
            className="text-primary hover:underline"
          >
            {language === "es" ? "Volver a formularios" : "Back to forms"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant">
          {language === "es" ? "Duplicando formulario..." : "Duplicating form..."}
        </p>
      </div>
    </div>
  );
}
