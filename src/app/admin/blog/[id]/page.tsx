"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import BlogEditor, { type BlogFormData } from "@/components/forms/BlogEditor";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EditBlogPostPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postData, setPostData] = useState<BlogFormData | null>(null);

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId]);

  const fetchPost = async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "blog_posts", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPostData({
          title: (data.title as string) || "",
          slug: (data.slug as string) || "",
          excerpt: (data.excerpt as string) || "",
          content: (data.content as string) || "",
          category: (data.category as string) || "news",
          featured_image: (data.featured_image as string) || "",
          author: (data.author as string) || "",
          language: (data.language as "en" | "es") || "en",
          published: (data.published as boolean) || false,
          status: (data.status as string) || "draft"
        });
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: BlogFormData) => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "blog_posts", postId), {
        ...data,
        updated_at: serverTimestamp()
      });
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error updating post:", error);
      alert(language === "es" ? "Error al actualizar el post" : "Error updating post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-9 h-9 bg-gray-200 rounded-lg" />
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><div className="h-4 w-20 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
            <div><div className="h-4 w-24 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
          </div>
          <div><div className="h-4 w-20 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><div className="h-4 w-24 bg-gray-200 rounded mb-2" /><div className="h-20 w-full bg-gray-200 rounded-lg" /></div>
            <div><div className="h-4 w-24 bg-gray-200 rounded mb-2" /><div className="h-20 w-full bg-gray-200 rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><div className="h-4 w-28 bg-gray-200 rounded mb-2" /><div className="h-40 w-full bg-gray-200 rounded-lg" /></div>
            <div><div className="h-4 w-28 bg-gray-200 rounded mb-2" /><div className="h-40 w-full bg-gray-200 rounded-lg" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><div className="h-4 w-20 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
            <div><div className="h-4 w-24 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
            <div><div className="h-4 w-16 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
          </div>
          <div><div className="h-4 w-28 bg-gray-200 rounded mb-2" /><div className="h-10 w-full bg-gray-200 rounded-lg" /></div>
          <div className="flex justify-end gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">{language === "es" ? "Editar Post" : "Edit Post"}</h1>
          <p className="text-gray-600 mt-1">{language === "es" ? "Modifica el artículo del blog" : "Modify the blog article"}</p>
        </div>
      </div>

      {postData && (
        <BlogEditor
          initialData={postData}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/blog")}
          saving={saving}
          isEditing={true}
        />
      )}
    </div>
  );
}
