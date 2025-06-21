// "use client";

// import { useState, useEffect, FormEvent } from "react";
// import { MessageTemplate } from "@/interfaces/template";
// import toast from "react-hot-toast";

// const SHORTCODES_DISPONIBLES = [
//   { code: "[nombreInvitado]", description: "El nombre completo del invitado." },
//   {
//     code: "[enlaceMagico]",
//     description: "El enlace único para que el invitado acceda.",
//   },
//   {
//     code: "[numeroAcompañantes]",
//     description: "El número de personas que vienen con el invitado (pax).",
//   },
//   {
//     code: "[nombreNovio1]",
//     description: "El nombre del primer miembro de la pareja.",
//   },
//   {
//     code: "[nombreNovio2]",
//     description: "El nombre del segundo miembro de la pareja.",
//   },
//   { code: "[fechaBoda]", description: "La fecha del evento." },
//   { code: "[lugarBoda]", description: "El lugar de la celebración." },
// ];

// interface TemplateFormProps {
//   initialData: Partial<MessageTemplate>;
//   isSubmitting: boolean;
//   onSubmit: (templateData: Partial<MessageTemplate>) => Promise<void>;
//   onCancelEdit?: () => void;
//   usedSystemSlugs: string[];
// }

// export default function TemplateForm({
//   initialData,
//   isSubmitting,
//   onSubmit,
//   onCancelEdit,
//   usedSystemSlugs,
// }: TemplateFormProps) {
//   const [formData, setFormData] = useState(initialData);

//   useEffect(() => {
//     setFormData(initialData);
//   }, [initialData]);

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     if (!formData.nombre || !formData.contenido) {
//       toast.error("El nombre y el contenido de la plantilla son obligatorios.");
//       return;
//     }

//     // ▼▼▼ LÓGICA CORREGIDA PARA PREPARAR EL PAYLOAD ▼▼▼
//     const finalFormData: Partial<MessageTemplate> = {
//       ...formData,
//       // 1. Aseguramos que 'cuerpo' siempre tenga el valor de 'contenido'
//       //    si tu modelo lo requiere y no tiene un campo de UI separado.
//       cuerpo: formData.contenido,

//       // 2. Si el slug seleccionado es "personalizado", lo enviamos como 'null' al backend.
//       //    Si no, enviamos el slug seleccionado (ej. "primer-contacto").
//       slug:
//         formData.slug === "personalizado" || !formData.slug
//           ? null
//           : formData.slug,
//     };

//     onSubmit(finalFormData);
//   };

//   const isEditing = !!initialData._id;

//   const isSlugTaken =
//     !isEditing &&
//     formData.slug &&
//     formData.slug !== "personalizado" &&
//     usedSystemSlugs.includes(formData.slug);

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="p-6 bg-white rounded-lg shadow space-y-4 border border-gray-200"
//     >
//       <h2 className="text-xl font-semibold">
//         {isEditing ? "Editando Plantilla" : "Crear Nueva Plantilla"}
//       </h2>

//       <div>
//         <label
//           htmlFor="nombre"
//           className="block text-sm font-medium text-gray-700"
//         >
//           Nombre de la Plantilla
//         </label>
//         <input
//           type="text"
//           name="nombre"
//           id="nombre"
//           value={formData.nombre || ""}
//           onChange={handleInputChange}
//           required
//           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//         />
//         <p className="text-xs text-gray-500 mt-1">
//           Un nombre para que identifiques esta plantilla (ej. "Invitación
//           Principal").
//         </p>
//       </div>

//       <div>
//         <label
//           htmlFor="slug"
//           className="block text-sm font-medium text-gray-700"
//         >
//           Tipo de Plantilla
//         </label>
//         <select
//           name="slug"
//           id="slug"
//           value={formData.slug || "personalizado"}
//           onChange={handleInputChange}
//           className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
//             isSlugTaken ? "border-red-500" : "border-gray-300"
//           }`}
//         >
//           <option value="personalizado">Personalizado (Uso General)</option>
//           <option value="primer-contacto">Primer Contacto (Invitación)</option>
//           <option value="recordatorio-rsvp">
//             Recordatorio de Confirmación
//           </option>
//           <option value="agradecimiento">Agradecimiento</option>
//         </select>
//         {isSlugTaken && (
//           <p className="text-red-600 text-sm mt-1">
//             ⚠️ Ya existe una plantilla de este tipo. Puedes editar la existente
//             desde la lista de abajo.
//           </p>
//         )}
//       </div>

//       <div>
//         <label
//           htmlFor="contenido"
//           className="block text-sm font-medium text-gray-700"
//         >
//           Contenido del Mensaje
//         </label>
//         <textarea
//           name="contenido"
//           id="contenido"
//           value={formData.contenido || ""}
//           onChange={handleInputChange}
//           required
//           rows={6}
//           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//         ></textarea>
//         <p className="text-xs text-gray-500 mt-1">
//           Este texto se usará para el cuerpo del mensaje y para procesar los
//           shortcodes.
//         </p>
//       </div>

//       <div className="flex items-center gap-4">
//         <button
//           type="submit"
//           disabled={isSubmitting || isSlugTaken}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
//         >
//           {isSubmitting
//             ? "Guardando..."
//             : isEditing
//             ? "Actualizar Plantilla"
//             : "Crear Plantilla"}
//         </button>
//         {isEditing && onCancelEdit && (
//           <button
//             type="button"
//             onClick={onCancelEdit}
//             className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
//           >
//             Cancelar Edición
//           </button>
//         )}
//       </div>

//       <div className="pt-4 border-t">
//         <h3 className="text-lg font-medium">📋 Shortcodes Disponibles</h3>
//         <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
//           {SHORTCODES_DISPONIBLES.map((sc) => (
//             <li key={sc.code}>
//               <code className="bg-gray-200 px-1 rounded">{sc.code}</code> -{" "}
//               {sc.description}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </form>
//   );
// }

"use client";

import { useState, useEffect, FormEvent } from "react";
import { MessageTemplate } from "@/interfaces/template";
import toast from "react-hot-toast";

const SHORTCODES_DISPONIBLES = [
  { code: "[nombreInvitado]", description: "El nombre completo del invitado." },
  {
    code: "[enlaceMagico]",
    description: "El enlace único para que el invitado acceda.",
  },
  {
    code: "[numeroAcompañantes]",
    description: "El número de personas que vienen con el invitado (pax).",
  },
  {
    code: "[nombreNovio1]",
    description: "El nombre del primer miembro de la pareja.",
  },
  {
    code: "[nombreNovio2]",
    description: "El nombre del segundo miembro de la pareja.",
  },
  { code: "[fechaBoda]", description: "La fecha del evento." },
  { code: "[lugarBoda]", description: "El lugar de la celebración." },
];

interface TemplateFormProps {
  initialData: Partial<MessageTemplate>;
  isSubmitting: boolean;
  onSubmit: (templateData: Partial<MessageTemplate>) => Promise<void>;
  onCancelEdit?: () => void;
  usedSystemSlugs: string[]; // Prop que contiene los slugs ya usados
}

export default function TemplateForm({
  initialData,
  isSubmitting,
  onSubmit,
  onCancelEdit,
  usedSystemSlugs,
}: TemplateFormProps) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.contenido) {
      toast.error("El nombre y el contenido de la plantilla son obligatorios.");
      return;
    }
    const finalFormData: Partial<MessageTemplate> = {
      ...formData,
      cuerpo: formData.contenido,
      slug:
        formData.slug === "personalizado" || !formData.slug
          ? null
          : formData.slug,
    };
    onSubmit(finalFormData);
  };

  const isEditing = !!initialData._id;

  // ▼▼▼ CORRECCIÓN: Añadida la comprobación Array.isArray(usedSystemSlugs) ▼▼▼
  const isSlugTaken =
    !isEditing &&
    formData.slug &&
    formData.slug !== "personalizado" &&
    Array.isArray(usedSystemSlugs) &&
    usedSystemSlugs.includes(formData.slug);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-lg shadow space-y-4 border border-gray-200"
    >
      <h2 className="text-xl font-semibold">
        {isEditing ? "Editando Plantilla" : "Crear Nueva Plantilla"}
      </h2>

      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre de la Plantilla
        </label>
        <input
          type="text"
          name="nombre"
          id="nombre"
          value={formData.nombre || ""}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700"
        >
          Tipo de Plantilla
        </label>
        <select
          name="slug"
          id="slug"
          value={formData.slug || "personalizado"}
          onChange={handleInputChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            isSlugTaken ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="personalizado">Personalizado (Uso General)</option>
          <option value="primer-contacto">Primer Contacto (Invitación)</option>
          <option value="recordatorio-rsvp">
            Recordatorio de Confirmación
          </option>
          <option value="agradecimiento">Agradecimiento</option>
        </select>
        {isSlugTaken && (
          <p className="text-red-600 text-sm mt-1">
            ⚠️ Ya existe una plantilla de este tipo. Puedes editar la existente
            desde la lista de abajo.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contenido"
          className="block text-sm font-medium text-gray-700"
        >
          Contenido del Mensaje
        </label>
        <textarea
          name="contenido"
          id="contenido"
          value={formData.contenido || ""}
          onChange={handleInputChange}
          required
          rows={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">
          Este texto se usará para el cuerpo del mensaje y para procesar los
          shortcodes.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || isSlugTaken}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
            ? "Actualizar Plantilla"
            : "Crear Plantilla"}
        </button>
        {isEditing && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancelar Edición
          </button>
        )}
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium">📋 Shortcodes Disponibles</h3>
        <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {SHORTCODES_DISPONIBLES.map((sc) => (
            <li key={sc.code}>
              <code className="bg-gray-200 px-1 rounded">{sc.code}</code> -{" "}
              {sc.description}
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
