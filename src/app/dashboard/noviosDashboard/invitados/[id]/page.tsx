// pages/dashboard/noviosDashboard/invitados/[id].tsx (o donde se encuentre tu archivo)
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EditarInvitadoModal from "@/app/components/admin/EditarInvitadoModal";
import { getInvitadoById } from "@/services/invitadosSercice";
import { getListasPorInvitado } from "@/services/broadcastService";
import { BroadcastList } from "@/interfaces/broadcast";
import PreguntasInvitado from "@/app/components/admin/PreguntasInvitado";

// Interfaz más completa para los detalles del invitado
interface PreguntaAsignada {
  preguntaId: string;
  pregunta: string;
  respuesta: string;
  subRespuesta?: string;
  fecha?: Date;
}

interface InvitadoDetallado {
  _id: string;
  nombre: string;
  telefono: string;
  invitadoDe: string;
  confirmacion: boolean | null;
  bodaId: string;
  pax?: number;
  // Este es el array que viene enriquecido desde tu controlador obtenerInvitado
  preguntasAsignadas?: PreguntaAsignada[];
}

export default function DetallesInvitado() {
  const params = useParams();
  const id = params.id as string;

  // Usamos la interfaz más específica para el estado
  const [invitado, setInvitado] = useState<InvitadoDetallado | null>(null);
  const [listasInvitado, setListasInvitado] = useState<BroadcastList[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores de API

  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id;
  const userRole = user?.tipoUsuario;

  const esAdmin = userRole === "admin";
  const esNovio = userRole === "novio" || userRole === "novia";
  const esInvitado = userRole === "guest";

  const esEditable = esAdmin || esNovio || (esInvitado && userId === id);

  useEffect(() => {
    const fetchInvitado = async () => {
      try {
        const data = await getInvitadoById(id);
        // Asumo que tu servicio devuelve el objeto del invitado directamente
        setInvitado(data);
      } catch (err) {
        console.error("❌ Error al cargar invitado:", err);
        // MEJORA: Mostrar error en la UI
        setError("No se pudieron cargar los datos del invitado.");
      }
    };

    const fetchListas = async () => {
      try {
        const listas = await getListasPorInvitado(id);
        setListasInvitado(listas);
      } catch (err) {
        console.error("❌ Error al cargar listas del invitado:", err);
        // No es crítico, así que solo logueamos el error
      }
    };

    if (id) {
      fetchInvitado();
      if (esNovio || esAdmin) {
        fetchListas();
      }
    }
    // MEJORA: Añadir esNovio y esAdmin al array de dependencias
  }, [id, esNovio, esAdmin]);

  // Esta comprobación inicial es clave y está bien implementada
  if (!invitado && !error) {
    // Muestra cargando si no hay invitado Y no hay error
    return (
      <p className="p-6 text-gray-600">⏳ Cargando datos del invitado...</p>
    );
  }

  // Muestra el error si ocurrió uno durante la carga
  if (error) {
    return <p className="p-6 text-red-500 font-bold">{error}</p>;
  }

  // Mensaje si, a pesar de todo, el invitado no se encontró
  if (!invitado) {
    return <p className="p-6 text-center">🙁 No se encontró al invitado.</p>;
  }

  return (
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
      {/* 🎉 Datos personales */}
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

        {esEditable && (
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setModalAbierto(true)}
          >
            ✏️ Editar Invitado
          </button>
        )}
      </section>

      {/* ❓ Preguntas y respuestas */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">❓ Preguntas asignadas</h2>
        {/* CORRECCIÓN: Usar optional chaining y pasar 'preguntas' como prop */}
        {invitado?.preguntasAsignadas?.length > 0 ? (
          <PreguntasInvitado preguntas={invitado.preguntasAsignadas} />
        ) : (
          <p className="text-gray-500 italic">
            Aún no tienes ningún detalle por confirmar con nosotros.
          </p>
        )}
      </section>

      {/* 📋 Listas de difusión (solo novios y admin) */}
      {(esNovio || esAdmin) && (
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

      {/* ... (resto de tus secciones: Enviar Mensaje, Galería, etc.) ... */}

      {/* 🛠️ Modal de edición */}
      {modalAbierto && (
        <EditarInvitadoModal
          isOpen={modalAbierto}
          invitado={invitado}
          onClose={() => setModalAbierto(false)}
          onSave={(actualizado) => setInvitado(actualizado)}
        />
      )}
    </div>
  );
}
