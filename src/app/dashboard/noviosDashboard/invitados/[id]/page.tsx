"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
  invitadoDe: string;
  confirmacion: boolean | null;
  bodaId: string;
}

export default function DetallesInvitado() {
  const params = useParams(); // ✅ Obtenemos los parámetros de la URL
  const id = params.id as string; // ✅ Convertimos a string si es necesario

  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitado = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No hay token de autenticación.");
        setLoading(false);
        return;
      }

      console.log("📡 Solicitando invitado con ID:", id); // 👀 Depuración

      try {
        const response = await fetch(`http://localhost:4000/api/guests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        console.log("🔍 Datos del invitado (desde API):", data);

        if (response.ok) {
          if (data._id) {
            setInvitado(data); // ✅ Asegurarnos de que tenemos un solo invitado
          } else {
            console.error("❌ La API no devolvió un invitado válido:", data);
          }
        } else {
          console.error("❌ Error al obtener invitado:", data.message);
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
      <div className="bg-white shadow-md rounded-lg p-4">
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
      </div>
    </div>
  );
}
