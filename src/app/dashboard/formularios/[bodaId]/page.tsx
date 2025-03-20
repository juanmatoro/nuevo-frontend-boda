"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Pregunta {
  _id: string;
  pregunta: string;
  opciones: string[];
  esObligatoria: boolean;
}

export default function FormulariosBodaPage() {
  const { bodaId } = useParams();
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchPreguntas = async () => {
      const token = localStorage.getItem("token");

      if (!token || !bodaId) {
        console.error("❌ Usuario no autenticado o bodaId no encontrado.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:4000/api/forms/questions/${bodaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();
        console.log("🔍 Preguntas cargadas:", data);
        setPreguntas(data);
      } catch (error) {
        console.error("❌ Error al obtener preguntas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntas();
  }, [bodaId]);

  // Detectar el scroll
  const handleScroll = () => {
    if (!listRef.current) return;

    const { scrollTop, clientHeight, scrollHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setShowScrollHint(false);
    } else {
      setShowScrollHint(true);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Gestión de Preguntas de la Boda</h2>

      <Link
        href={`/dashboard/formularios/${bodaId}/crearPregunta`}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 inline-block"
      >
        ➕ Crear Nueva Pregunta
      </Link>

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : preguntas.length > 0 ? (
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto max-h-[70vh] p-2 border border-gray-300 rounded-lg"
        >
          <ul className="mt-4 space-y-4">
            {preguntas.map((pregunta) => (
              <li key={pregunta._id} className="border p-4 rounded-lg">
                <p className="font-bold">{pregunta.pregunta}</p>
                <p>Opciones: {pregunta.opciones.join(", ")}</p>
                <p>Obligatoria: {pregunta.esObligatoria ? "✅ Sí" : "❌ No"}</p>

                <div className="mt-2 space-x-2">
                  <Link
                    href={`/dashboard/formularios/${bodaId}/editarPregunta/${pregunta._id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    ✏️ Editar
                  </Link>

                  <button
                    onClick={async () => {
                      if (confirm("¿Seguro que deseas eliminar esta pregunta?")) {
                        try {
                          const token = localStorage.getItem("token");
                          await fetch(
                            `http://localhost:4000/api/forms/questions/${pregunta._id}`,
                            {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          setPreguntas(preguntas.filter((p) => p._id !== pregunta._id));
                        } catch (error) {
                          console.error("❌ Error al eliminar pregunta:", error);
                        }
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Indicador de que se puede deslizar */}
          {showScrollHint && (
            <div className="text-center text-gray-500 mt-2">
              ⬇️ <span className="text-sm">Desliza para ver más preguntas</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600">No hay preguntas registradas.</p>
      )}
    </div>
  );
}
