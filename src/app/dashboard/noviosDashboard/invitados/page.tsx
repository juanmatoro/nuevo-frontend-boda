"use client";

import { useState, useEffect } from "react";
import Link from "next/link"

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
  invitadoDe: string;
}

export default function InvitadosPage() {
  const [invitados, setInvitados] = useState<Invitado[]>([]); // 📌 Tipo seguro
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvitados, setTotalInvitados] = useState(0); // 📌 Contador de invitados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 5;

  useEffect(() => {
    const fetchInvitados = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setError("❌ Usuario no autenticado.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      const bodaId = user.bodaId; // 📌 Obtener bodaId del usuario

      if (!bodaId) {
        setError("❌ No se encontró bodaId en el usuario.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:4000/api/guests/invitados/${bodaId}?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();
        console.log("🔍 Respuesta de la API:", data);

        setInvitados(Array.isArray(data.invitados) ? data.invitados : []);
        setTotalPages(data.totalPages || 1);
        setTotalInvitados(data.total || 0); // 📌 Asignamos el total de invitados
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
      <div className="flex justify-between items-center p-6">
        <Link href="/dashboard/noviosDashboard/invitados/nuevo-invitado" className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          ➕ Añadir Invitado
        </Link>
        <Link href="/dashboard/noviosDashboard/invitados/upload" className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          📂 Subir Excel
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">🎉 Lista de Invitados</h2>

      {/* 📌 Contador de invitados */}
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
          <li key={invitado._id} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold">{invitado.nombre}</p>
              <p>📞 {invitado.telefono}</p>
              <p>👰 Invitado de: {invitado.invitadoDe}</p>
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

      {/* Paginación */}
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
