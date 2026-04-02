"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { FormField, FieldType } from "@/types/forms";

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  language: string;
}

const fieldTypes: { value: FieldType; label: string; labelEs: string }[] = [
  { value: 'text', label: 'Text', labelEs: 'Texto corto' },
  { value: 'email', label: 'Email', labelEs: 'Correo electrónico' },
  { value: 'textarea', label: 'Textarea', labelEs: 'Texto largo' },
  { value: 'select', label: 'Select', labelEs: 'Selección única' },
  { value: 'radio', label: 'Radio', labelEs: 'Opciones múltiples' },
  { value: 'checkbox', label: 'Checkbox', labelEs: 'Casillas de verificación' },
  { value: 'number', label: 'Number', labelEs: 'Número' },
  { value: 'date', label: 'Date', labelEs: 'Fecha' },
  { value: 'phone', label: 'Phone', labelEs: 'Teléfono' },
];

function generateId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function FormBuilder({ fields, onChange, language }: FormBuilderProps) {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: generateId(),
      type,
      label: language === 'es' ? 'Nuevo campo' : 'New Field',
      labelEs: 'Nuevo campo',
      required: false,
      placeholder: language === 'es' ? 'Tu respuesta aquí' : 'Your answer here',
      placeholderEs: 'Tu respuesta aquí',
    };
    onChange([...fields, newField]);
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === fields.length - 1)) {
      return;
    }
    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    onChange(newFields);
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const newOption = {
      label: language === 'es' ? 'Opción' : 'Option',
      labelEs: 'Opción',
      value: `option_${Date.now()}`
    };

    updateField(fieldId, {
      options: [...(field.options || []), newOption]
    });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;

    updateField(fieldId, {
      options: field.options.filter((_, i) => i !== optionIndex)
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, key: string, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [key]: value };
    updateField(fieldId, { options: newOptions });
  };

  return (
    <div className="space-y-6">
      {/* Fields List */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Field Header */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm font-medium text-primary">
                  {fieldTypes.find(t => t.value === field.type)?.[language === 'es' ? 'labelEs' : 'label']}
                </span>
                <span className="text-sm text-gray-700 font-medium">
                  {language === 'es' && field.labelEs ? field.labelEs : field.label}
                </span>
                {field.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {language === 'es' ? 'Requerido' : 'Required'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveField(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveField(index, 'down')}
                  disabled={index === fields.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                  className="p-1 text-gray-400 hover:text-primary"
                >
                  {expandedField === field.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => removeField(field.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Field Settings */}
            {expandedField === field.id && (
              <div className="p-4 space-y-4">
                {/* Label */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label (English)
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label (Español)
                    </label>
                    <input
                      type="text"
                      value={field.labelEs || ''}
                      onChange={(e) => updateField(field.id, { labelEs: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (English)
                    </label>
                    <textarea
                      value={field.description || ''}
                      onChange={(e) => updateField(field.id, { description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Español)
                    </label>
                    <textarea
                      value={field.descriptionEs || ''}
                      onChange={(e) => updateField(field.id, { descriptionEs: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Placeholder */}
                {(field.type === 'text' || field.type === 'email' || field.type === 'textarea' || field.type === 'number' || field.type === 'phone') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder (English)
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder (Español)
                      </label>
                      <input
                        type="text"
                        value={field.placeholderEs || ''}
                        onChange={(e) => updateField(field.id, { placeholderEs: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Required */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required-${field.id}`}
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`required-${field.id}`} className="text-sm font-medium text-gray-700">
                    {language === 'es' ? 'Campo requerido' : 'Required field'}
                  </label>
                </div>

                {/* Options for select, radio, checkbox */}
                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {language === 'es' ? 'Opciones' : 'Options'}
                      </h4>
                      <button
                        onClick={() => addOption(field.id)}
                        className="text-sm text-primary hover:text-primary-hover font-medium"
                      >
                        + {language === 'es' ? 'Agregar opción' : 'Add option'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {field.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 w-6">{optIndex + 1}.</span>
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => updateOption(field.id, optIndex, 'label', e.target.value)}
                            placeholder="Option label (EN)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                          />
                          <input
                            type="text"
                            value={option.labelEs || ''}
                            onChange={(e) => updateOption(field.id, optIndex, 'labelEs', e.target.value)}
                            placeholder="Etiqueta (ES)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                          />
                          <button
                            onClick={() => removeOption(field.id, optIndex)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!field.options || field.options.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {language === 'es' ? 'No hay opciones. Agrega una para continuar.' : 'No options yet. Add one to get started.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">
              {language === 'es' 
                ? 'No hay campos aún. Agrega tu primer campo abajo.' 
                : 'No fields yet. Add your first field below.'}
            </p>
          </div>
        )}
      </div>

      {/* Add Field Buttons */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">
          {language === 'es' ? 'Agregar campo' : 'Add field'}
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {fieldTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => addField(type.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              {language === 'es' ? type.labelEs : type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
