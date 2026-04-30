"use client";

import React, { useState, useEffect } from "react";
import { Upload, Edit3, Save } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSiteImages, updateSiteImage, SiteImage } from "@/lib/site-images";
import { useToast } from "@/components/Toast";

interface ExtendedSiteImage extends SiteImage {
  editing: boolean;
  newPath: string;
}

export default function AdminImagesPage() {
  const { language } = useLanguage();
  const [images, setImages] = useState<ExtendedSiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingImage, setSavingImage] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await getSiteImages();
      setImages(data.map((img): ExtendedSiteImage => ({
        ...img,
        editing: false,
        newPath: img.path
      })));
    } catch {
      showToast("Error loading images", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (key: string) => {
    setImages(prev => prev.map(img => 
      img.key === key 
        ? { ...img, editing: !img.editing }
        : img
    ));
  };

  const handleImageChange = (key: string, newUrl: string) => {
    setImages(prev => prev.map(img => 
      img.key === key
        ? { ...img, newPath: newUrl, path: newUrl }
        : img
    ));
  };

  const saveImage = async (image: ExtendedSiteImage) => {
    setSavingImage(image.key);
    try {
      await updateSiteImage(image.key, { path: image.newPath });
      showToast("Image updated", "success");
      toggleEdit(image.key);
      loadImages(); // Refresh
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSavingImage(null);
    }
  };

  if (loading) return <SkeletonGrid />;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">{language === 'es' ? 'Imágenes del Sitio' : 'Site Images'}</h1>
        <button onClick={loadImages} className="text-primary hover:text-primary-hover">
          <Upload className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map(image => (
          <ImageCard
            key={image.key}
            image={image}
            onEditToggle={() => toggleEdit(image.key)}
            onImageChange={(url) => handleImageChange(image.key, url)}
            onSave={() => saveImage(image)}
            saving={savingImage === image.key}
            language={language}
          />
        ))}
      </div>
    </div>
  );
}

function ImageCard({ image, onEditToggle, onImageChange, onSave, saving, language }: {
  image: ExtendedSiteImage;
  onEditToggle: () => void;
  onImageChange: (url: string) => void;
  onSave: () => void;
  saving: boolean;
  language: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg">{image.key.replace('-', ' ').toUpperCase()}</h3>
        <div className="flex gap-2">
          {image.editing ? (
            <button onClick={onSave} disabled={saving} className="p-2 text-green-600 hover:text-green-700">
              <Save className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={onEditToggle} className="p-2 text-blue-600 hover:text-blue-700">
              <Edit3 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {image.editing ? (
        <ImageUpload 
          value={image.newPath}
          onChange={onImageChange}
          path="site-images"
          label="Nueva imagen"
        />
      ) : (
        <img 
          src={`${image.path}?v=${image.updatedAt.seconds}`} 
          alt={image.descriptionEn}
          className="w-full aspect-video object-cover rounded-lg mb-4"
        />
      )}

      <div className="space-y-2 text-sm">
        <p><strong>Path:</strong> {image.path}</p>
        <p><strong>Updated:</strong> {image.updatedAt.toDate().toLocaleDateString()}</p>
        <p>{language === 'es' ? image.descriptionEs : image.descriptionEn}</p>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64" />
      ))}
    </div>
  );
}
