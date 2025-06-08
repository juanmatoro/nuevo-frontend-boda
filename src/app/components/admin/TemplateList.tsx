"use client";

import { MessageTemplate } from "@/interfaces/template";

interface TemplateListProps {
  templates: MessageTemplate[];
  isLoading: boolean;
  onEdit: (template: MessageTemplate) => void;
  onDelete: (templateId: string) => void;
}

export default function TemplateList({
  templates,
  isLoading,
  onEdit,
  onDelete,
}: TemplateListProps) {
  if (isLoading) {
    return <p>Cargando plantillas...</p>;
  }

  if (templates.length === 0) {
    return (
      <p className="text-gray-500">Aún no has creado ninguna plantilla.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {templates.map((template) => (
        <li
          key={template._id}
          className="p-4 bg-white rounded-md shadow-sm border flex justify-between items-center"
        >
          <div>
            <p className="font-bold">{template.nombre}</p>
            <p className="text-sm text-gray-600 truncate max-w-md">
              {template.contenido}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(template)}
              className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(template._id)}
              className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
