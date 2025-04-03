"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EditarInvitadoModal from "@/app/components/admin/EditarInvitadoModal";
import { getInvitadoById } from "@/services/invitadosSercice";

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
  invitadoDe: string;
  confirmacion: boolean | null;
  bodaId: string;
  listas?: string[];
}

export default function DetallesInvitado() {
  const params = useParams();
  const id = params.id as string;

  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitado = async () => {
      setLoading(true);
      try {
        const data = await getInvitadoById(id);
        setInvitado(data as Invitado);
      } catch (error) {
        console.error("❌ Error al obtener invitado:", error);
      } finally {
        setLoading(false);
      }
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.tipoUsuario);
      setUserId(user._id);
    }

    if (id) fetchInvitado();
  }, [id]);

  const handleSave = (updated: Invitado) => {
    setInvitado(updated);
    setShowModal(false);
  };

  const esAdmin = userRole === "admin";
  const esNovio = userRole === "novio" || userRole === "novia";
  const esInvitado = userRole === "guest" && userId === id;

  if (loading) return <p className="text-gray-500 text-center">Cargando...</p>;
  if (!invitado) return <p className="text-gray-500 text-center">Invitado no encontrado.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* 🎉 Datos personales */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">📇 Datos del invitado</h2>
        <p><strong>Nombre:</strong> {invitado.nombre}</p>
        <p><strong>Teléfono:</strong> {invitado.telefono}</p>
        <p><strong>Invitado de:</strong> {invitado.invitadoDe}</p>
        <p>
          <strong>Confirmación:</strong>{" "}
          {invitado.confirmacion === null
            ? "Pendiente"
            : invitado.confirmacion
            ? "✅ Confirmado"
            : "❌ Rechazado"}
        </p>

        {(esInvitado || esNovio || esAdmin) && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ✏️ Editar datos
          </button>
        )}
      </section>

      {/* ❓ Preguntas y respuestas */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">❓ Preguntas asignadas</h2>
        <p className="text-gray-500">🔧 Aquí irán las preguntas asignadas y sus respuestas...</p>
      </section>

      {/* 📋 Listas de difusión (solo novios y admin) */}
      {(esNovio || esAdmin) && (
        <section className="bg-white shadow rounded p-4 space-y-2">
          <h2 className="text-xl font-bold">📋 Listas de difusión</h2>
          {invitado.listas && invitado.listas.length > 0 ? (
            <ul className="list-disc ml-5 text-sm">
              {invitado.listas.map((lista, i) => (
                <li key={i}>{lista}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Este invitado no está en ninguna lista.</p>
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
        <p className="text-gray-500">📷 Aquí se mostrará la galería de imágenes del invitado.</p>
        {(esNovio || esAdmin) && (
          <p className="text-sm text-gray-400">
            💡 Los novios pueden revisar y moderar las imágenes.
          </p>
        )}
      </section>

      {/* 🛠️ Modal de edición */}
      {showModal && invitado && (
        <EditarInvitadoModal
          invitado={invitado}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
