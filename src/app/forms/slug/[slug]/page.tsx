"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FormSlugPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const slug = params.slug as string;
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const findFormBySlug = async () => {
      try {
        const q = query(
          collection(db, "forms"),
          where("customSlug", "==", slug),
          where("published", "==", true),
          where("status", "==", "published"),
          limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const formDoc = snapshot.docs[0];
          router.replace(`/forms/${formDoc.id}`);
        } else {
          setNotFound(true);
        }
      } catch (error: unknown) {
        console.error("Error finding form by slug:", error);
        setNotFound(true);
      }
    };

    if (slug) {
      findFormBySlug();
    }
  }, [slug, router]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === "es" ? "Formulario no encontrado" : "Form Not Found"}
          </h1>
          <p className="text-gray-600">
            {language === "es"
              ? "Este enlace puede ser inválido o el formulario no está publicado."
              : "This link may be invalid or the form is not published."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-gray-600">
          {language === "es" ? "Cargando..." : "Loading..."}
        </p>
      </div>
    </div>
  );
}
