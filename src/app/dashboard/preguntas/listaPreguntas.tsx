"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Pregunta {
  _id: string;
  pregunta: string;
  opciones: string[];
  esObligatoria: boolean;
}

export default function ListaPreguntas() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);

  useEffect(() => {
    const fetchPreguntas = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const bodaId = user.bodaId;
      if (!bodaId) return;

      try {
        const response = await fetch(`http://localhost:4000/api/forms/questions/${bodaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setPreguntas(data);
      } catch (error) {
        console.error("❌ Error al obtener preguntas:", error);
      }
    };

    fetchPreguntas();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Listado de Preguntas</h2>
      <ul className="mt-4 space-y-4">
        {preguntas.map((pregunta) => (
          <li key={pregunta._id} className="border p-4 rounded-lg">
            <p className="font-bold">{pregunta.pregunta}</p>
            <p>Opciones: {pregunta.opciones.join(", ")}</p>
            <p>Obligatoria: {pregunta.esObligatoria ? "✅ Sí" : "❌ No"}</p>

            <div className="mt-2 space-x-2">
              <Link
                href={`/dashboard/noviosDashboard/formularios/editarPregunta/${pregunta._id}`}
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
    </div>
  );
}
