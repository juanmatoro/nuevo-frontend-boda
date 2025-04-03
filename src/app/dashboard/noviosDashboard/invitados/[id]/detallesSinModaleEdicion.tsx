"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ModalEdicionInvitado from "@/app/components/admin/EditarInvitadoModal";

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
  invitadoDe: string;
  confirmacion: boolean | null;
  bodaId: string;
  respuestas?: { [preguntaId: string]: string };
  listas?: string[];
  imagenes?: {
    url: string;
    estado: "publicada" | "borrador";
  }[];
}

export default function DetallesInvitadoPanel() {
  const { id } = useParams();
  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const esInvitado = user?.role === "guest";
  const esNovio = user?.role === "novio" || user?.role === "novia";
  const esAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (!token || !storedUser) return;

      const userParsed = JSON.parse(storedUser);
      setUser(userParsed);

      try {
        const res = await fetch(`http://localhost:4000/api/guests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setInvitado(data);
      } catch (error) {
        console.error("❌ Error al obtener invitado:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Cargando...</p>;
  if (!invitado) return <p className="text-center text-gray-500">Invitado no encontrado.</p>;

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

        {/* ✏️ Mostrar botón de editar si puede */}
        {(esInvitado || esNovio || esAdmin) && (
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ✏️ Editar datos
          </button>
        )}
      </section>

      {/* ❓ Preguntas y respuestas */}
      <section className="bg-white shadow rounded p-4 space-y-2">
        <h2 className="text-xl font-bold">❓ Preguntas asignadas</h2>
        {/* Aquí mostraremos preguntas y respuestas, luego haremos fetch por invitado */}
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
        {/* Aquí irán las imágenes subidas */}
        <p className="text-gray-500">📷 Aquí se mostrará la galería de imágenes del invitado.</p>
        {/* Solo novios y admin pueden publicar o borrar imágenes */}
        {(esNovio || esAdmin) && (
          <p className="text-sm text-gray-400">
            💡 Los novios pueden revisar y moderar las imágenes.
          </p>
        )}
      </section>
    </div>
  );
}
