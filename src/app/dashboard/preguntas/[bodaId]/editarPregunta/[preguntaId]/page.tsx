"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/services/axiosInstance";

export default function EditarPreguntaPage() {
  const [pregunta, setPregunta] = useState<{
    pregunta: string;
    opciones: string[];
    esObligatoria: boolean;
  }>({
    pregunta: "",
    opciones: [],
    esObligatoria: false,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const { preguntaId, bodaId } = useParams(); // Extraemos los IDs de la URL

  useEffect(() => {
    const fetchPregunta = async () => {
      const token = localStorage.getItem("token");
      if (!token || !preguntaId) {
        console.error("❌ No hay token o preguntaId.");
        return;
      }

      try {
        const response = await axiosInstance.get(`/preguntas/${preguntaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;

        setPregunta({
          pregunta: data.pregunta || "",
          opciones: Array.isArray(data.opciones) ? data.opciones : [],
          esObligatoria: data.esObligatoria || false,
        });
      } catch (error) {
        console.error("❌ Error al obtener la pregunta:", error);
        setMessage("Error al cargar la pregunta.");
      } finally {
        setLoading(false);
      }
    };

    fetchPregunta();
  }, [preguntaId]);

  // 📌 Manejador de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPregunta({
      ...pregunta,
      [e.target.name]: e.target.value,
    });
  };

  // 📌 Manejador de cambios en las opciones
  const handleOpcionesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPregunta({
      ...pregunta,
      opciones: e.target.value.split(",").map((op) => op.trim()),
    });
  };

  // 📌 Manejador de envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("⚠ No hay token de autenticación.");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/forms/questions/${preguntaId}`,
        pregunta,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Pregunta actualizada con éxito.");
      setTimeout(() => router.push(`/dashboard/formularios/${bodaId}`), 1500);
    } catch (error) {
      console.error("❌ Error al actualizar:", error);
      setMessage("Error al actualizar la pregunta.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">✏️ Editar Pregunta</h2>

      {loading ? (
        <p className="text-gray-500">⏳ Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de la pregunta */}
          <div>
            <label className="block font-semibold">Pregunta:</label>
            <input
              type="text"
              name="pregunta"
              value={pregunta.pregunta}
              onChange={handleChange}
              className="border p-2 w-full"
              required
            />
          </div>

          {/* Opciones de respuesta */}
          <div>
            <label className="block font-semibold">
              Opciones (separadas por coma):
            </label>
            <input
              type="text"
              name="opciones"
              value={pregunta.opciones.join(", ")}
              onChange={handleOpcionesChange}
              className="border p-2 w-full"
            />
          </div>

          {/* Checkbox de obligatoriedad */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="esObligatoria"
              checked={pregunta.esObligatoria}
              onChange={() =>
                setPregunta({
                  ...pregunta,
                  esObligatoria: !pregunta.esObligatoria,
                })
              }
              className="mr-2"
            />
            <label>Es obligatoria</label>
          </div>

          {/* Mensaje de estado */}
          {message && <p className="text-blue-500">{message}</p>}

          {/* Botón de guardar */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            💾 Guardar Cambios
          </button>
        </form>
      )}
    </div>
  );
}
