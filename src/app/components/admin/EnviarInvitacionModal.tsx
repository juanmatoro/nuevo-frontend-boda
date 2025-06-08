"use client";

import { useState, useEffect } from "react";
import { getMessageTemplatesByBoda } from "@/services/invitatiosnService"; // Necesitarás crear esta función de servicio
import { getPendingGuestsByBoda } from "@/services/invitadosSercice"; // Y esta también
import { sendInitialInvitations } from "@/services/invitatiosnService"; // Y esta para enviar
import { MessageTemplate } from "@/interfaces/template"; // Define esta interfaz
import { Invitado } from "@/interfaces/invitado"; // Tu interfaz de invitado
import toast from "react-hot-toast";

interface EnviarInvitacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bodaId: string;
}

export default function EnviarInvitacionModal({
  isOpen,
  onClose,
  bodaId,
}: EnviarInvitacionModalProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [pendingGuests, setPendingGuests] = useState<Invitado[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Cargar datos necesarios cuando se abre el modal
    const loadModalData = async () => {
      setIsLoading(true);
      try {
        // Asume que estas funciones de servicio llaman a tus endpoints del backend
        const templatesData = await getMessageTemplatesByBoda(bodaId);
        const pendingGuestsData = await getPendingGuestsByBoda(bodaId);

        // Filtrar plantillas de tipo "Invitación Inicial" si tienes ese campo
        setTemplates(
          templatesData.filter(
            (t) =>
              t.messageType === "INITIAL_INVITATION" ||
              t.slug === "primer-contacto"
          )
        );
        setPendingGuests(pendingGuestsData);
      } catch (error) {
        console.error(
          "Error al cargar datos para el modal de invitación:",
          error
        );
        toast.error("No se pudieron cargar los datos necesarios.");
      } finally {
        setIsLoading(false);
      }
    };

    loadModalData();
  }, [isOpen, bodaId]);

  const handleSendInvitations = async () => {
    if (!selectedTemplateId) {
      toast.error("Por favor, selecciona una plantilla para la invitación.");
      return;
    }
    if (pendingGuests.length === 0) {
      toast.error("No hay invitados pendientes de invitar.");
      return;
    }

    setIsSending(true);
    const toastId = toast.loading(
      `Enviando ${pendingGuests.length} invitaciones...`
    );

    try {
      // Llamar al endpoint /api/invitations/send
      // No pasamos guestIds para que el backend envíe a todos los pendientes
      const result = await sendInitialInvitations(selectedTemplateId);

      toast.success(
        `Proceso completado. Enviados: ${
          result.enviadosExitosamenteAlServicio?.length || 0
        }. Errores: ${result.erroresEncontrados?.length || 0}.`,
        { id: toastId, duration: 6000 }
      );

      // Si hubo errores, mostrarlos en la consola para depuración
      if (result.erroresEncontrados?.length > 0) {
        console.error(
          "Errores durante el envío de invitaciones:",
          result.erroresEncontrados
        );
        toast.error(
          "Algunas invitaciones no se pudieron enviar. Revisa la consola para más detalles."
        );
      }

      onClose(); // Cerrar el modal después de enviar
    } catch (error) {
      console.error("Error en la llamada para enviar invitaciones:", error);
      toast.error("Ocurrió un error inesperado al enviar las invitaciones.", {
        id: toastId,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-bold">💌 Enviar Invitaciones Iniciales</h2>

        {isLoading ? (
          <p>Cargando datos...</p>
        ) : (
          <>
            <p>
              Se enviará una invitación a{" "}
              <strong>{pendingGuests.length} invitado(s)</strong> que aún no la
              han recibido.
            </p>

            <div>
              <label
                htmlFor="template-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Selecciona la Plantilla de Invitación
              </label>
              <select
                id="template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full border p-2 rounded-md shadow-sm"
                disabled={isSending}
              >
                <option value="">-- Elige una plantilla --</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-500">
              Nota: El mensaje se personalizará para cada invitado usando los
              shortcodes de la plantilla (ej. [nombreInvitado], [enlaceMagico]).
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendInvitations}
                disabled={isSending || isLoading || !selectedTemplateId}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                {isSending
                  ? "Enviando..."
                  : `Enviar a ${pendingGuests.length} Invitados`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
