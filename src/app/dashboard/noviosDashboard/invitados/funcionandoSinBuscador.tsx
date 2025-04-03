"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getInvitadosByBoda } from "@/services/invitadosSercice";
import GuestSearch from "@/app/components/guests/GuestSearch";


interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
  invitadoDe: string;
  confirmacion: boolean | null;
  bodaId: string;
}

export default function InvitadosPage() {
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvitados, setTotalInvitados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const limit = 4;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      setError("❌ Usuario no autenticado.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);
    setUserRole(user.role);
    const bodaId = user.bodaId;

    if (!bodaId) {
      setError("❌ No se encontró bodaId en el usuario.");
      setLoading(false);
      return;
    }

    const fetchInvitados = async () => {
      setLoading(true);
      try {
        const data = await getInvitadosByBoda(bodaId, page, limit) as {
          invitados: Invitado[];
          totalPages: number;
          total: number;
        };

        setInvitados(Array.isArray(data.invitados) ? data.invitados : []);
        setTotalPages(data.totalPages || 1);
        setTotalInvitados(data.total || 0);
      } catch (error) {
        console.error("❌ Error al obtener invitados:", error);
        setError("❌ Error al obtener la lista de invitados.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitados();
  }, [page]);

  return (
    <div className="p-6">
      {userRole !== "guest" && (
        <div className="flex justify-between items-center p-6">
          <Link
            href="/dashboard/noviosDashboard/invitados/nuevo-invitado"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            ➕ Añadir Invitado
          </Link>
          <Link
            href="/dashboard/noviosDashboard/invitados/upload"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            📂 Subir Excel
          </Link>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">🎉 Lista de Invitados</h2>

      <p className="text-lg font-semibold mb-2">
        👥 Total de Invitados: <span className="text-blue-500">{totalInvitados}</span>
      </p>

      {loading && <p className="text-blue-500">⏳ Cargando invitados...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && invitados.length === 0 && (
        <p className="text-gray-500">No hay invitados registrados.</p>
      )}

      <ul className="mt-4 space-y-4">
        {invitados.map((invitado) => (
          <li
            key={invitado._id}
            className="border p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{invitado.nombre}</p>
              <p>📞 {invitado.telefono}</p>
              <p>👰 Invitado de: {invitado.invitadoDe}</p>
              <p>
            <strong>Confirmación:</strong>{" "}
            {invitado.confirmacion === null
              ? "Pendiente"
              : invitado.confirmacion
              ? "✅ Confirmado"
              : "❌ Rechazado"}
          </p>
            </div>
            <Link
              href={`/dashboard/noviosDashboard/invitados/${invitado._id}`}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Ver detalles
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          ⬅️ Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  );
}
