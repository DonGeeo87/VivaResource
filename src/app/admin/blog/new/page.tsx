"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import BlogEditor, { type BlogFormData } from "@/components/forms/BlogEditor";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewBlogPostPage(): JSX.Element {
  const router = useRouter();
  const { language } = useLanguage();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: BlogFormData) => {
    setSaving(true);
    try {
      await addDoc(collection(db, "blog_posts"), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error saving post:", error);
      alert(language === "es" ? "Error al guardar el post" : "Error saving post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/admin/blog")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{language === "es" ? "Nuevo Post" : "New Post"}</h1>
          <p className="text-gray-600 mt-1">{language === "es" ? "Crea un nuevo artículo para el blog" : "Create a new blog article"}</p>
        </div>
      </div>

      <BlogEditor
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/blog")}
        saving={saving}
        isEditing={false}
      />
    </div>
  );
}
