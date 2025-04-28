"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getInvitadosByBoda,
  getAllGuestsByBoda,
} from "@/services/invitadosSercice";
import GuestSearch from "@/app/components/guests/GuestSearch";
import { obtenerPreguntasPorBoda } from "@/services/preguntasService";
import FiltroDeInvitados from "@/app/components/admin/FiltroInvitados";

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
  const [todosLosInvitados, setTodosLosInvitados] = useState<Invitado[]>([]);
  const [filteredInvitados, setFilteredInvitados] = useState<Invitado[]>([]);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvitados, setTotalInvitados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [bodaId, setBodaId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const limit = 15;

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
    setBodaId(user.bodaId);

    if (!user.bodaId) {
      setError("❌ No se encontró bodaId en el usuario.");
      setLoading(false);
      return;
    }

    const fetchInvitados = async () => {
      setLoading(true);
      try {
        const data = (await getInvitadosByBoda(user.bodaId, page, limit)) as {
          invitados: Invitado[];
          totalPages: number;
          total: number;
        };

        const fetchedInvitados = Array.isArray(data.invitados)
          ? data.invitados
          : [];
        setInvitados(fetchedInvitados);
        setFilteredInvitados(fetchedInvitados);
        setTotalPages(data.totalPages || 1);
        setTotalInvitados(data.total || 0);
      } catch (error) {
        console.error("❌ Error al obtener invitados:", error);
        setError("❌ Error al obtener la lista de invitados.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTodosLosInvitados = async () => {
      try {
        const data = (await getAllGuestsByBoda(user.bodaId)) as {
          invitados: Invitado[];
        };
        setTodosLosInvitados(data.invitados || []);
      } catch (error) {
        console.error("❌ Error al obtener todos los invitados:", error);
      }
    };

    fetchTodosLosInvitados();

    const fetchPreguntas = async () => {
      try {
        const preguntasData = await obtenerPreguntasPorBoda(user.bodaId);
        setPreguntas(preguntasData);
      } catch (err) {
        console.error("❌ Error al obtener preguntas:", err);
      }
    };

    fetchInvitados();
    fetchPreguntas();
  }, [page]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredInvitados(invitados);
    } else {
      const lowerQuery = query.toLowerCase();
      const result = todosLosInvitados.filter(
        (invitado) =>
          invitado.nombre.toLowerCase().includes(lowerQuery) ||
          invitado.telefono.includes(lowerQuery)
      );
      setFilteredInvitados(result);
    }
  };

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

      <GuestSearch onSearch={handleSearch} />

      {preguntas.length > 0 && (
        <FiltroDeInvitados
          preguntas={preguntas}
          bodaId={bodaId}
          onFiltrar={setFilteredInvitados}
        />
      )}

      <p className="text-lg font-semibold mb-2">
        👥 Total de Invitados:{" "}
        <span className="text-blue-500">{totalInvitados}</span>
      </p>

      {loading && <p className="text-blue-500">⏳ Cargando invitados...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && filteredInvitados.length === 0 && (
        <p className="text-gray-500">
          No hay invitados que coincidan con la búsqueda.
        </p>
      )}

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInvitados.map((invitado) => (
          <li
            key={invitado._id}
            className="border p-4 rounded-lg flex flex-col justify-between shadow-sm bg-white"
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
              className="self-start inline-block bg-blue-500 text-white px-4 py-2 rounded mt-1.5"
            >
              Ver detalles
            </Link>
          </li>
        ))}
      </ul>

      {!searchQuery && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            ⬅️ Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Siguiente ➡️
          </button>
        </div>
      )}
    </div>
  );
}
