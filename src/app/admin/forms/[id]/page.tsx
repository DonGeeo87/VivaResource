"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Eye, Calendar, FileText, Users, MessageSquare, Star, X, Copy, Check, AlertCircle } from "lucide-react";
import { doc, getDoc, setDoc, addDoc, collection, Timestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLanguage } from "@/contexts/LanguageContext";
import FormBuilder from "@/components/forms/FormBuilder";
import FormSharePanel from "@/components/forms/FormSharePanel";
import { Form, FormField } from "@/types/forms";
import { formTemplates } from "@/data/formTemplates";

interface EventOption {
  id: string;
  title: string;
}

interface TemplateOption {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  icon: React.ReactNode;
  color: string;
}

const availableTemplates: TemplateOption[] = [
  {
    id: 'event_registration',
    name: 'Event Registration',
    nameEs: 'Registro a Evento',
    description: 'Standard form for event registration',
    descriptionEs: 'Formulario estándar para eventos',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    id: 'workshop_registration',
    name: 'Workshop Registration',
    nameEs: 'Registro a Taller',
    description: 'Form with skill level assessment',
    descriptionEs: 'Formulario con evaluación de nivel',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-green-500'
  },
  {
    id: 'feedback',
    name: 'Feedback Form',
    nameEs: 'Retroalimentación',
    description: 'Post-event satisfaction survey',
    descriptionEs: 'Encuesta de satisfacción',
    icon: <Star className="w-6 h-6" />,
    color: 'bg-yellow-500'
  },
  {
    id: 'volunteer_application',
    name: 'Volunteer Application',
    nameEs: 'Solicitud de Voluntario',
    description: 'Comprehensive volunteer recruitment',
    descriptionEs: 'Reclutamiento de voluntarios',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-purple-500'
  },
  {
    id: 'contact',
    name: 'Contact Form',
    nameEs: 'Formulario de Contacto',
    description: 'General inquiry form',
    descriptionEs: 'Formulario de consulta general',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'bg-pink-500'
  }
];

export default function AdminFormEditorPage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const formId = params.id as string;
  const isEditing = formId && formId !== 'new';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [showTemplates, setShowTemplates] = useState(!isEditing);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  
  // Save success modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedFormId, setSavedFormId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<Partial<Form>>({
    title: '',
    titleEs: '',
    description: '',
    descriptionEs: '',
    fields: [],
    status: 'draft',
    published: false,
    shareMode: 'both',
    linkedEventId: undefined,
    customSlug: '',
    settings: {
      allowMultipleSubmissions: true,
      showProgressBar: true,
      requireEmail: false,
      thankYouMessage: 'Thank you for your submission!',
      thankYouMessageEs: '¡Gracias por tu envío!',
    }
  });

  const loadTemplate = (templateId: string) => {
    const template = formTemplates[templateId];
    if (!template) return;

    setFormData({
      title: template.title,
      titleEs: template.titleEs,
      description: template.description,
      descriptionEs: template.descriptionEs,
      fields: template.fields,
      status: 'draft',
      published: false,
      shareMode: 'both',
      linkedEventId: undefined,
      customSlug: '',
      settings: {
        allowMultipleSubmissions: template.settings?.allowMultipleSubmissions ?? true,
        showProgressBar: template.settings?.showProgressBar ?? true,
        requireEmail: template.settings?.requireEmail ?? false,
        thankYouMessage: template.thankYouMessage || 'Thank you for your submission!',
        thankYouMessageEs: template.thankYouMessageEs || '¡Gracias por tu envío!',
      }
    });
    setShowTemplates(false);
  };

  useEffect(() => {
    fetchEvents();
    if (isEditing) {
      fetchForm(formId);
    }
  }, [formId, isEditing]);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const eventsList: EventOption[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title_es || doc.data().title_en || doc.id,
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchForm = async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'forms', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as Form;
        setFormData({
          ...data,
          published: data.published ?? false,
          shareMode: data.shareMode ?? 'both',
          linkedEventId: data.linkedEventId,
          customSlug: data.customSlug,
          settings: data.settings || {
            allowMultipleSubmissions: true,
            showProgressBar: true,
            requireEmail: false,
          }
        });
      }
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Limpiar campos undefined antes de guardar (Firestore no acepta undefined)
      const cleanFormData = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => value !== undefined)
      );

      const formDataToSave = {
        ...cleanFormData,
        updatedAt: Timestamp.now(),
      };

      let resultFormId = formId;

      if (isEditing) {
        await setDoc(doc(db, 'forms', formId), formDataToSave, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, 'forms'), {
          ...formDataToSave,
          createdAt: Timestamp.now(),
        });
        resultFormId = docRef.id;
      }

      // Mostrar modal de éxito
      setSavedFormId(resultFormId);
      setShowSaveModal(true);
    } catch (error) {
      console.error('Error saving form:', error);
      alert(language === 'es' ? 'Error al guardar: ' + (error instanceof Error ? error.message : 'Error desconocido') : 'Error saving: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleViewForm = () => {
    window.open(`/forms/${savedFormId}`, '_blank');
  };

  const handleGoToForms = () => {
    router.push('/admin/forms');
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/forms/${savedFormId}`;
    navigator.clipboard.writeText(shareUrl).catch(() => {
      // Fallback: select the input text
      const input = document.getElementById('share-link-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
      }
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateFields = (fields: FormField[]) => {
    setFormData({ ...formData, fields });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-9 h-9 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          </div>
          <div className="h-10 w-28 bg-gray-200 rounded-lg" />
        </div>
        {/* Template selector skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Form area skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-6">
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
            <div>
              <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-24 w-full bg-gray-200 rounded-lg" />
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="h-5 w-48 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/admin/forms')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing
              ? (language === 'es' ? 'Editar Formulario' : 'Edit Form')
              : (language === 'es' ? 'Nuevo Formulario' : 'New Form')}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'es'
              ? 'Crea y personaliza tu formulario'
              : 'Create and customize your form'}
          </p>
        </div>
        <div className="flex gap-3">
          {isEditing && (
            <a
              href={`/forms/${formId}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              <Eye className="w-5 h-5" />
              {language === 'es' ? 'Vista Previa' : 'Preview'}
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar' : 'Save')}
          </button>
        </div>
      </div>

      {/* Template Selector - Only show for new forms */}
      {!isEditing && showTemplates && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'es' ? '📋 Elige una Plantilla' : '📋 Choose a Template'}
            </h2>
            <p className="text-gray-600">
              {language === 'es'
                ? 'Selecciona una plantilla predefinida para comenzar rápidamente'
                : 'Select a pre-defined template to get started quickly'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setPreviewTemplate(template.id)}
                className="group relative p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg text-left"
              >
                <div className={`${template.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {template.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {language === 'es' ? template.nameEs : template.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'es' ? template.descriptionEs : template.description}
                </p>
                <div className="absolute top-4 right-4">
                  <div className="bg-blue-500 text-white p-2 rounded-full">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              {language === 'es' ? 'Comenzar desde cero' : 'Start from scratch'} →
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Form Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-lg mb-4">
              {language === 'es' ? 'Campos del Formulario' : 'Form Fields'}
            </h2>
            <FormBuilder
              fields={formData.fields || []}
              onChange={updateFields}
              language={language}
            />
          </div>
        </div>

        {/* Sidebar - Settings */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg mb-4">
              {language === 'es' ? 'Información Básica' : 'Basic Info'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "es" ? "Título (Inglés) *" : "Title (English) *"}
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Form title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "es" ? "Título (Español) *" : "Title (Español) *"}
                </label>
                <input
                  type="text"
                  value={formData.titleEs || ''}
                  onChange={(e) => setFormData({ ...formData, titleEs: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Título del formulario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "es" ? "Descripción (Inglés)" : "Description (English)"}
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Form description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "es" ? "Descripción (Español)" : "Description (Español)"}
                </label>
                <textarea
                  value={formData.descriptionEs || ''}
                  onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Descripción del formulario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Slug personalizado (opcional)' : 'Custom Slug (optional)'}
                </label>
                <input
                  type="text"
                  value={formData.customSlug || ''}
                  onChange={(e) => setFormData({ ...formData, customSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="mi-formulario"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'es' 
                    ? 'Se usará en la URL: /forms/slug/[slug]' 
                    : 'Will be used in URL: /forms/slug/[slug]'}
                </p>
              </div>
            </div>
          </div>

          {/* Event Association */}
          {isEditing && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {language === 'es' ? 'Asociar a Evento' : 'Link to Event'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'es' ? 'Seleccionar evento (opcional)' : 'Select event (optional)'}
                  </label>
                  <select
                    value={formData.linkedEventId || ''}
                    onChange={(e) => setFormData({ ...formData, linkedEventId: e.target.value || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">
                      {language === 'es' ? 'Sin evento (formulario independiente)' : 'No event (standalone form)'}
                    </option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.title}</option>
                    ))}
                  </select>
                </div>
                {formData.linkedEventId ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {language === 'es' 
                        ? 'Este formulario está asociado a un evento' 
                        : 'This form is linked to an event'}
                    </p>
                    <a
                      href={`/admin/events/${formData.linkedEventId}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {language === 'es' ? 'Ver evento →' : 'View event →'}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {language === 'es' 
                      ? 'Asocia este formulario a un evento para agrupar respuestas' 
                      : 'Link this form to an event to group responses'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg mb-4">
              {language === 'es' ? 'Configuración' : 'Settings'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowMultiple"
                  checked={formData.settings?.allowMultipleSubmissions ?? true}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { 
                      ...formData.settings, 
                      allowMultipleSubmissions: e.target.checked,
                      showProgressBar: formData.settings?.showProgressBar ?? true,
                      requireEmail: formData.settings?.requireEmail ?? false,
                    }
                  })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="allowMultiple" className="text-sm text-gray-700">
                  {language === 'es' 
                    ? 'Permitir múltiples envíos' 
                    : 'Allow multiple submissions'}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showProgress"
                  checked={formData.settings?.showProgressBar ?? true}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { 
                      ...formData.settings, 
                      showProgressBar: e.target.checked,
                      allowMultipleSubmissions: formData.settings?.allowMultipleSubmissions ?? true,
                      requireEmail: formData.settings?.requireEmail ?? false,
                    }
                  })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="showProgress" className="text-sm text-gray-700">
                  {language === 'es' 
                    ? 'Mostrar barra de progreso' 
                    : 'Show progress bar'}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requireEmail"
                  checked={formData.settings?.requireEmail ?? false}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { 
                      ...formData.settings, 
                      requireEmail: e.target.checked,
                      allowMultipleSubmissions: formData.settings?.allowMultipleSubmissions ?? true,
                      showProgressBar: formData.settings?.showProgressBar ?? true,
                    }
                  })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="requireEmail" className="text-sm text-gray-700">
                  {language === 'es' 
                    ? 'Requerir email' 
                    : 'Require email'}
                </label>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-lg mb-4">
              {language === 'es' ? 'Mensaje de Agradecimiento' : 'Thank You Message'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "es" ? "Mensaje (Inglés)" : "Message (English)"}
                </label>
                <input
                  type="text"
                  value={formData.settings?.thankYouMessage || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      thankYouMessage: e.target.value,
                      allowMultipleSubmissions: formData.settings?.allowMultipleSubmissions ?? true,
                      showProgressBar: formData.settings?.showProgressBar ?? true,
                      requireEmail: formData.settings?.requireEmail ?? false,
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "es" ? "Mensaje (Español)" : "Message (Español)"}
                </label>
                <input
                  type="text"
                  value={formData.settings?.thankYouMessageEs || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    settings: { 
                      ...formData.settings, 
                      thankYouMessageEs: e.target.value,
                      allowMultipleSubmissions: formData.settings?.allowMultipleSubmissions ?? true,
                      showProgressBar: formData.settings?.showProgressBar ?? true,
                      requireEmail: formData.settings?.requireEmail ?? false,
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Share Panel - Only when editing */}
          {isEditing && (
            <FormSharePanel
              formId={formId}
              published={formData.published ?? false}
              shareMode={formData.shareMode ?? 'both'}
              customSlug={formData.customSlug}
              linkedEventId={formData.linkedEventId}
              onPublishChange={(published) => {
                // Actualizar ambos campos: published (boolean) y status (string)
                setFormData({
                  ...formData,
                  published,
                  status: published ? 'published' : 'draft',
                });
              }}
              onShareModeChange={(shareMode) => setFormData({ ...formData, shareMode })}
            />
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && formTemplates[previewTemplate] && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'es' ? 'Vista Previa de Plantilla' : 'Template Preview'}
              </h2>
              <button onClick={() => setPreviewTemplate(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {language === 'es' ? formTemplates[previewTemplate].titleEs : formTemplates[previewTemplate].title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {formTemplates[previewTemplate].fields.length} {language === 'es' ? 'campos' : 'fields'}
              </p>
              <div className="space-y-3">
                {formTemplates[previewTemplate].fields.map((field: FormField, index: number) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {language === 'es' && field.labelEs ? field.labelEs : field.label}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{field.type}</p>
                    </div>
                    {field.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        {language === 'es' ? 'Requerido' : 'Required'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setPreviewTemplate(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button onClick={() => { loadTemplate(previewTemplate); setPreviewTemplate(null); }} className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-hover">
                {language === 'es' ? 'Usar Plantilla' : 'Use Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {language === 'es' ? '¡Formulario Guardado!' : 'Form Saved!'}
              </h2>
              <p className="text-green-100 mt-2">
                {language === 'es' ? 'Tu formulario está listo para compartir' : 'Your form is ready to share'}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Publish Note */}
              {!formData.published && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    {language === 'es'
                      ? 'El formulario está en borrador. Publícalo para que sea visible públicamente.'
                      : 'Form is in draft. Publish it to make it publicly visible.'}
                  </p>
                </div>
              )}

              {/* Share Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === 'es' ? 'Enlace para compartir' : 'Share Link'}
                </label>
                <div className="flex gap-2">
                  <input
                    id="share-link-input"
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${savedFormId}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-600"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-primary text-white hover:bg-primary-hover'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied
                      ? (language === 'es' ? '¡Copiado!' : 'Copied!')
                      : (language === 'es' ? 'Copiar' : 'Copy')}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleViewForm}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary/90 transition-all"
                >
                  <Eye className="w-5 h-5" />
                  {language === 'es' ? 'Ver Formulario' : 'View Form'}
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                >
                  <FileText className="w-5 h-5" />
                  {language === 'es' ? 'Volver a Edición' : 'Back to Editing'}
                </button>
                <button
                  onClick={handleGoToForms}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {language === 'es' ? 'Volver a Formularios' : 'Back to Forms'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
