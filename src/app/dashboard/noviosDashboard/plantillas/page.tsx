// "use client";

// import { useState, useEffect, useCallback } from "react";
// import toast from "react-hot-toast";
// import { MessageTemplate } from "@/interfaces/template";

// // ▼▼▼ CORRECCIÓN: Importar con los nombres exactos de tu archivo de servicio ▼▼▼
// import {
//   obtenerPlantillasPorBoda,
//   crearPlantilla,
//   editarPlantilla,
//   eliminarPlantilla,
// } from "@/services/templateService";

// // Importar los nuevos componentes
// import TemplateForm from "@/app/components/admin/TemplateForm";
// import TemplateList from "@/app/components/admin/TemplateList";

// // Estado inicial para el formulario, se usa para crear y para resetear
// const INITIAL_TEMPLATE_STATE: Partial<MessageTemplate> = {
//   nombre: "",
//   contenido: "",
//   slug: "personalizado", // Slug por defecto para plantillas creadas por el usuario
//   cuerpo: "", // Incluido porque estaba en tu schema
// };

// export default function GestionPlantillasPage() {
//   const [templates, setTemplates] = useState<MessageTemplate[]>([]);
//   const [bodaId, setBodaId] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Este estado ahora controla qué plantilla se está editando
//   const [editingTemplate, setEditingTemplate] =
//     useState<Partial<MessageTemplate> | null>(null);

//   // Carga inicial de datos
//   const fetchTemplates = useCallback(async (idDeBoda: string) => {
//     setIsLoading(true);
//     try {
//       // ▼▼▼ CORRECCIÓN: Usar el nombre correcto de la función del servicio ▼▼▼
//       const data = await obtenerPlantillasPorBoda(idDeBoda);
//       setTemplates(data);
//     } catch (error) {
//       toast.error("No se pudieron cargar las plantillas existentes.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const userString = localStorage.getItem("user");
//     if (userString) {
//       const user = JSON.parse(userString);
//       if (user?.bodaId) {
//         setBodaId(user.bodaId);
//         fetchTemplates(user.bodaId);
//       }
//     }
//   }, [fetchTemplates]);

//   const handleFormSubmit = async (templateData: Partial<MessageTemplate>) => {
//     const isEditing = !!editingTemplate?._id;
//     const toastId = toast.loading(
//       isEditing ? "Actualizando plantilla..." : "Creando plantilla..."
//     );
//     setIsSubmitting(true);

//     try {
//       if (isEditing) {
//         // ▼▼▼ CORRECCIÓN: Usar el nombre correcto de la función del servicio ▼▼▼
//         await editarPlantilla(editingTemplate._id!, {
//           ...templateData,
//           bodaId,
//         });
//         toast.success("Plantilla actualizada.", { id: toastId });
//       } else {
//         // ▼▼▼ CORRECCIÓN: Usar el nombre correcto de la función del servicio ▼▼▼
//         await crearPlantilla({ ...templateData, bodaId });
//         toast.success("Plantilla creada.", { id: toastId });
//       }
//       setEditingTemplate(null); // Resetea el formulario a modo "crear"
//       fetchTemplates(bodaId); // Recargar la lista de plantillas
//     } catch (error) {
//       console.error("Error al guardar la plantilla:", error);
//       toast.error("Ocurrió un error al guardar.", { id: toastId });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDelete = async (templateId: string) => {
//     if (!window.confirm("¿Seguro que quieres eliminar esta plantilla?")) return;
//     const toastId = toast.loading("Eliminando plantilla...");
//     try {
//       // ▼▼▼ CORRECCIÓN: Usar el nombre correcto de la función del servicio ▼▼▼
//       await eliminarPlantilla(templateId);
//       toast.success("Plantilla eliminada.", { id: toastId });
//       fetchTemplates(bodaId);
//     } catch (error) {
//       toast.error("No se pudo eliminar la plantilla.", { id: toastId });
//     }
//   };

//   return (
//     <div className="p-6 max-w-5xl mx-auto space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800">
//           ✍️ Editor de Plantillas de Mensajes
//         </h1>
//         <p className="text-gray-600 mt-2">
//           Crea y gestiona las plantillas para comunicarte con tus invitados.
//         </p>
//       </div>

//       <TemplateForm
//         initialData={editingTemplate || INITIAL_TEMPLATE_STATE}
//         isSubmitting={isSubmitting}
//         onSubmit={handleFormSubmit}
//         onCancelEdit={() => setEditingTemplate(null)}
//       />

//       <div className="space-y-4">
//         <h2 className="text-xl font-semibold">Mis Plantillas Guardadas</h2>
//         <TemplateList
//           templates={templates}
//           isLoading={isLoading}
//           onEdit={(template) => {
//             setEditingTemplate(template);
//             window.scrollTo({ top: 0, behavior: "smooth" });
//           }}
//           onDelete={handleDelete}
//         />
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { MessageTemplate } from "@/interfaces/template";
import {
  obtenerPlantillasPorBoda,
  crearPlantilla,
  editarPlantilla,
  eliminarPlantilla,
} from "@/services/templateService";

import TemplateForm from "@/app/components/admin/TemplateForm";
import TemplateList from "@/app/components/admin/TemplateList";

const INITIAL_TEMPLATE_STATE: Partial<MessageTemplate> = {
  nombre: "",
  contenido: "",
  slug: "personalizado",
  cuerpo: "",
};

export default function GestionPlantillasPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [bodaId, setBodaId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<Partial<MessageTemplate> | null>(null);

  const fetchTemplates = useCallback(async (idDeBoda: string) => {
    setIsLoading(true);
    try {
      const data = await obtenerPlantillasPorBoda(idDeBoda);
      setTemplates(data);
    } catch (error) {
      toast.error("No se pudieron cargar las plantillas existentes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      if (user?.bodaId) {
        setBodaId(user.bodaId);
        fetchTemplates(user.bodaId);
      }
    }
  }, [fetchTemplates]);

  const usedSystemSlugs = useMemo(() => {
    return templates
      .map((t) => t.slug)
      .filter((slug): slug is string => !!slug && slug !== "personalizado");
  }, [templates]);

  const handleFormSubmit = async (templateData: Partial<MessageTemplate>) => {
    const isEditing = !!editingTemplate?._id;
    if (
      !isEditing &&
      templateData.slug &&
      usedSystemSlugs.includes(templateData.slug)
    ) {
      toast.error(`Ya existe una plantilla de tipo "${templateData.slug}".`);
      return;
    }

    const toastId = toast.loading(
      isEditing ? "Actualizando plantilla..." : "Creando plantilla..."
    );
    setIsSubmitting(true);

    try {
      const payload = { ...templateData, bodaId };
      if (isEditing) {
        await editarPlantilla(editingTemplate._id!, payload);
        toast.success("Plantilla actualizada.", { id: toastId });
      } else {
        await crearPlantilla(payload);
        toast.success("Plantilla creada.", { id: toastId });
      }
      setEditingTemplate(null);
      fetchTemplates(bodaId);
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
      toast.error("Ocurrió un error al guardar.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta plantilla?")) return;
    const toastId = toast.loading("Eliminando plantilla...");
    try {
      await eliminarPlantilla(templateId);
      toast.success("Plantilla eliminada.", { id: toastId });
      fetchTemplates(bodaId);
    } catch (error) {
      toast.error("No se pudo eliminar la plantilla.", { id: toastId });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          ✍️ Editor de Plantillas de Mensajes
        </h1>
        <p className="text-gray-600 mt-2">
          Crea y gestiona las plantillas para comunicarte con tus invitados.
        </p>
      </div>

      <TemplateForm
        initialData={editingTemplate || INITIAL_TEMPLATE_STATE}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onCancelEdit={() => setEditingTemplate(null)}
        usedSystemSlugs={usedSystemSlugs}
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mis Plantillas Guardadas</h2>
        <TemplateList
          templates={templates}
          isLoading={isLoading}
          onEdit={(template) => {
            setEditingTemplate(template);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
