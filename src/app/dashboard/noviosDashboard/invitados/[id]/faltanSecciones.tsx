"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EditarInvitadoModal from "@/app/components/admin/EditarInvitadoModal"; // Ajusta si cambia de carpeta
import { getInvitadoById } from "@/services/invitadosSercice"; // Ajusta si cambia de carpeta

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

  // 📌 Cargar usuario desde localStorage
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userRole = user?.tipoUsuario;
  const userId = user?._id;

  // 📌 Lógica de edición
  const esEditable =
    userRole === "admin" ||
    userRole === "novio" ||
    userRole === "novia" ||
    (userRole === "guest" && userId === id);

  useEffect(() => {
    const fetchInvitado = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No hay token de autenticación.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/api/guests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (response.ok && data._id) {
          setInvitado(data);
        } else {
          console.error("❌ Error en datos:", data.message);
        }
      } catch (error) {
        console.error("❌ Error en la petición:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInvitado();
  }, [id]);

  if (loading) return <p className="text-gray-500 text-center">Cargando...</p>;
  if (!invitado) return <p className="text-gray-500 text-center">Invitado no encontrado.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Detalles de {invitado.nombre}</h2>

      <div className="bg-white shadow-md rounded-lg p-4 space-y-3">
      <p className="text-lg">📞 Teléfono: <span className="font-semibold">{invitado.telefono}</span></p>
      <p className="text-lg">👰 Invitado de: <span className="font-semibold">{invitado.invitadoDe}</span></p>
      <p className="text-lg">
        ✅ Confirmación:
        {invitado.confirmacion === null ? (
        <span className="text-yellow-500 font-semibold"> Pendiente</span>
        ) : invitado.confirmacion ? (
        <span className="text-green-500 font-semibold"> Confirmado</span>
        ) : (
        <span className="text-red-500 font-semibold"> Rechazado</span>
        )}
      </p>

      {/* ✅ Mostrar botón si se puede editar */}
      {esEditable && (
        <button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
        onClick={() => setShowModal(true)}
        >
        ✏️ Editar Invitado
        </button>
      )}
      </div>

      {/* ✅ Modal de edición */}
      {showModal && (
      <EditarInvitadoModal
        isOpen={showModal}
        invitado={invitado}
        onClose={() => setShowModal(false)}
        onSave={(updated: Invitado) => setInvitado(updated)}
      />
      )}
    </div>
  );
}
