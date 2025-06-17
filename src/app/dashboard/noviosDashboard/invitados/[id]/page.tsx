// pages/dashboard/noviosDashboard/invitados/[id].tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

// Tus componentes
import EditarInvitadoModal from "@/app/components/admin/EditarInvitadoModal";
import PreguntasInvitado from "@/app/components/admin/PreguntasInvitado";

// Tus servicios
import {
  getInvitadoById,
  guardarRespuestasPorAdmin,
  guardarMisRespuestas,
} from "@/services/invitadosSercice";
import { getListasPorInvitado } from "@/services/broadcastService";

// Tus interfaces
import { BroadcastList } from "@/interfaces/broadcast";
import { Question } from "@/interfaces/preguntas";
import { Invitado } from "@/interfaces/invitado";

interface InvitadoDetallado extends Invitado {
  preguntasAsignadas?: Question[];
}

export default function DetallesInvitado() {
  const params = useParams();
  const id = params.id as string;

  const [invitado, setInvitado] = useState<InvitadoDetallado | null>(null);
  const [listasInvitado, setListasInvitado] = useState<BroadcastList[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user?._id);
      setUserRole(user?.tipoUsuario);
    }
  }, []);

  const esAdmin = userRole === "admin";
  const esNovio = userRole === "novio" || userRole === "novia";
  const esElPropioInvitado = userRole === "GUEST_SESSION" && userId === id;
  // ▼▼▼ CORRECCIÓN: Definimos la variable que faltaba ▼▼▼
  const esEditablePorAdmin = esAdmin || esNovio;

  const fetchInvitado = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getInvitadoById(id);
      data.preguntasAsignadas = Array.isArray(data.preguntasAsignadas)
        ? data.preguntasAsignadas
        : [];
      setInvitado(data);
    } catch (err) {
      console.error("❌ Error al cargar invitado:", err);
      setError("No se pudieron cargar los datos del invitado.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvitado();
    if (esAdmin || esNovio) {
      getListasPorInvitado(id)
        .then(setListasInvitado)
        .catch((err) => console.error("Error al cargar listas:", err));
    }
  }, [id, esAdmin, esNovio, fetchInvitado]);

  const handleGuardarRespuestas = async (respuestasParaEnviar: any[]) => {
    const toastId = toast.loading("Guardando respuestas...");
    try {
      if (esElPropioInvitado) {
        // Llama al servicio para que el invitado guarde sus propias respuestas
        await guardarMisRespuestas(respuestasParaEnviar);
      } else if (esAdmin || esNovio) {
        // Llama al servicio para que el novio/admin guarde las respuestas del invitado
        await guardarRespuestasPorAdmin(id, respuestasParaEnviar);
      } else {
        throw new Error("Usuario sin permisos para guardar.");
      }

      toast.success("Respuestas guardadas con éxito.", { id: toastId });
      fetchInvitado(); // Vuelve a cargar los datos para reflejar los cambios
    } catch (err) {
      toast.error("No se pudieron guardar las respuestas.", { id: toastId });
      console.error(err);
      throw err;
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500">
        ⏳ Cargando datos del invitado...
      </p>
    );
  if (error)
    return <p className="p-6 text-center text-red-500 font-bold">{error}</p>;
  if (!invitado)
    return <p className="p-6 text-center">🙁 Invitado no encontrado.</p>;

  // ▼▼▼ CORRECCIÓN CLAVE: Lógica para determinar si se puede editar ▼▼▼
  const puedeEditarRespuestas = esElPropioInvitado || esAdmin || esNovio;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* ... (Tu JSX para el botón de volver y los datos personales se mantiene igual) ... */}
      <div className="p-6 max-w-3xl mx-auto space-y-8">
        {/* 🔙 Botón de volver */}
        {(esAdmin || esNovio) && (
          <div className="mb-4">
            <Link
              href="/dashboard/noviosDashboard/invitados"
              className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              ⬅️ Volver a la lista de invitados
            </Link>
          </div>
        )}
      </div>
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">📇 Datos del invitado</h2>
        <p>
          <strong>Nombre:</strong> {invitado.nombre}
        </p>
        <p>
          <strong>Teléfono:</strong> {invitado.telefono}
        </p>
        <p>
          <strong>Invitado de:</strong> {invitado.invitadoDe}
        </p>
        <p>
          <strong>Confirmación:</strong>{" "}
          {invitado.confirmacion === null
            ? "Pendiente"
            : invitado.confirmacion
            ? "✅ Confirmado"
            : "❌ Rechazado"}
        </p>
        {(esAdmin || esNovio) && (
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setModalAbierto(true)}
          >
            ✏️ Editar Datos Generales
          </button>
        )}
      </section>

      {/* Sección de Preguntas y Respuestas */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">❓ Preguntas y Respuestas</h2>
        {/* ▼▼▼ LLAMADA AL COMPONENTE CON EL 'mode' CORREGIDO ▼▼▼ */}
        <PreguntasInvitado
          preguntas={invitado.preguntasAsignadas!}
          mode={puedeEditarRespuestas ? "edit" : "view"}
          onSave={handleGuardarRespuestas}
        />
      </section>

      {/* Sección de Listas de Difusión (solo para novios/admin) */}
      {esEditablePorAdmin && (
        <section className="bg-white shadow rounded p-4 space-y-2">
          <h2 className="text-xl font-bold">📋 Listas de difusión</h2>
          {listasInvitado.length > 0 ? (
            <ul className="list-disc ml-5 text-sm">
              {listasInvitado.map((lista) => (
                <li key={lista._id}>{lista.nombre}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              Este invitado no está en ninguna lista.
            </p>
          )}
        </section>
      )}

      {/* Modal para editar los datos generales */}
      {modalAbierto && (
        <EditarInvitadoModal
          isOpen={modalAbierto}
          invitado={invitado}
          onClose={() => setModalAbierto(false)}
          onSave={(actualizado) => {
            // Actualiza el estado local para que el cambio se vea inmediatamente
            setInvitado((prev) =>
              prev ? { ...prev, ...actualizado } : actualizado
            );
          }}
        />
      )}
    </div>
  );
}
