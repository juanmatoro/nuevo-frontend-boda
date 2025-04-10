"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EditarInvitadoModal from "@/app/components/admin/EditarInvitadoModal"; // Ajusta si cambia de carpeta
import { getInvitadoById } from "@/services/invitadosSercice"; // Ajusta si cambia de carpeta
import { getListasPorInvitado } from "@/services/broadcastService"; // Ajusta si cambia de carpeta
import { BroadcastList } from "@/interfaces/broadcast";
import PreguntasInvitado from "@/app/components/admin/PreguntasInvitado"; // Ajusta si cambia de carpeta

export default function DetallesInvitado() {
  const params = useParams();
  const id = params.id as string;

  const [invitado, setInvitado] = useState<any>(null);
  const [listasInvitado, setListasInvitado] = useState<BroadcastList[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id;
  const userRole = user?.tipoUsuario;

  const esAdmin = userRole === "admin";
  const esNovio = userRole === "novio" || userRole === "novia";
  const esInvitado = userRole === "guest";

  const esEditable = esAdmin || esNovio || (esInvitado && userId === id); // Solo el propio invitado puede editarse

  useEffect(() => {
    const fetchInvitado = async () => {
      try {
        const data = await getInvitadoById(id);
        setInvitado(data);
      } catch (err) {
        console.error("❌ Error al cargar invitado:", err);
      }
    };

    const fetchListas = async () => {
      try {
        const listas = await getListasPorInvitado(id);
        setListasInvitado(listas);
        console.log("Listas del invitado:", listas);
      } catch (err) {
        console.error("❌ Error al cargar listas del invitado:", err);
      }
    };

    if (id) {
      fetchInvitado();
      if (esNovio || esAdmin) {
        fetchListas();
      }
    }
  }, [id]);

  if (!invitado)
    return (
      <p className="p-6 text-gray-600">⏳ Cargando datos del invitado...</p>
    );

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

        {/* ✏️ Mostrar botón de editar si puede */}
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
        {invitado?.preguntasAsignadas?.length > 0 ? (
          <PreguntasInvitado />
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

      {/* 📩 Botones de envío de mensajes (solo novios) */}
      {esNovio && (
        <section className="bg-white shadow rounded p-4 space-y-2">
          <h2 className="text-xl font-bold">📩 Enviar mensaje</h2>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            📤 Enviar mensaje por WhatsApp
          </button>
        </section>
      )}

      {/* 🖼️ Galería de imágenes */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">🖼️ Galería de imágenes</h2>
        <p className="text-gray-500">
          📷 Aquí se mostrará la galería de imágenes del invitado.
        </p>
        {(esNovio || esAdmin) && (
          <p className="text-sm text-gray-400">
            💡 Los novios pueden revisar y moderar las imágenes.
          </p>
        )}
      </section>

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
