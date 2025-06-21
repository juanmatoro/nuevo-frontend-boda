// src/app/invitado/panel/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

// Importar el componente de preguntas que ya tienes
import PreguntasInvitado from "@/app/components/admin/PreguntasInvitado";

// Importar la nueva función de servicio para obtener el perfil del invitado
import {
  getMyGuestProfile,
  guardarMisRespuestas,
} from "@/services/invitadosSercice";

// Importar las interfaces necesarias
import { Invitado, Question } from "@/interfaces/preguntas";

interface InvitadoDetallado extends Invitado {
  preguntasAsignadas?: Question[];
}

export default function GuestPanelPage() {
  const [invitado, setInvitado] = useState<InvitadoDetallado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para buscar los datos del propio invitado autenticado
  const fetchMyProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Esta nueva función de servicio llamará a GET /api/guests/me/profile
      const data = await getMyGuestProfile();
      data.preguntasAsignadas = Array.isArray(data.preguntasAsignadas)
        ? data.preguntasAsignadas
        : [];
      setInvitado(data);
    } catch (err) {
      console.error("❌ Error al cargar el perfil del invitado:", err);
      setError(
        "No hemos podido cargar tu información. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  // Función para manejar el guardado de respuestas (se la pasaremos al componente hijo)
  const handleGuardarRespuestas = async (respuestasParaEnviar: any[]) => {
    const toastId = toast.loading("Guardando tus respuestas...");
    try {
      await guardarMisRespuestas(respuestasParaEnviar);
      toast.success("¡Tus respuestas se han guardado!", { id: toastId });
      // Vuelve a cargar el perfil para reflejar los cambios
      fetchMyProfile();
    } catch (err) {
      toast.error("No se pudieron guardar las respuestas.", { id: toastId });
      throw err; // Relanza para que el componente hijo sepa que falló
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500">
        ⏳ Cargando tu información...
      </p>
    );
  if (error)
    return <p className="p-6 text-center text-red-500 font-bold">{error}</p>;
  if (!invitado)
    return (
      <p className="p-6 text-center">
        🙁 No se encontró tu perfil de invitado.
      </p>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Saludo de bienvenida */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          ¡Hola, {invitado.nombre}!
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido a tu panel personal de la boda.
        </p>
      </div>

      {/* Sección de Datos Personales (Solo para ver) */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">📇 Tus Datos</h2>
        <p>
          <strong>Invitado/a de:</strong> {invitado.invitadoDe}
        </p>
        <p>
          <strong>Tu Confirmación:</strong>{" "}
          {invitado.confirmacion === null
            ? "Pendiente de respuesta"
            : invitado.confirmacion
            ? "✅ Asistirás"
            : "❌ No asistirás"}
        </p>
        <p>
          <strong>Asistentes Totales (pax):</strong> {invitado.pax ?? "N/A"}
        </p>
        {/* Aquí podrías añadir un botón para editar datos básicos si creas un modal para ello */}
      </section>

      {/* Sección de Preguntas y Respuestas (Aquí el invitado puede editar) */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">
          ❓ Por favor, confírmanos estos detalles
        </h2>
        <PreguntasInvitado
          preguntas={invitado.preguntasAsignadas!}
          mode={"edit"} // Siempre en modo edición para el invitado
          onSave={handleGuardarRespuestas}
        />
      </section>

      {/* Aquí podrías añadir otras secciones para el invitado, como una galería de fotos */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">🖼️ ¡Comparte tus fotos!</h2>
        <p className="text-gray-500">
          Próximamente podrás subir aquí las fotos que hagas durante la boda.
        </p>
      </section>
    </div>
  );
}
