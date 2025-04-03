"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/axiosInstance";

export default function CrearPreguntaPage() {
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState<string[]>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [esObligatoria, setEsObligatoria] = useState(false);
  const [esConfirmacionAsistencia, setEsConfirmacionAsistencia] = useState(false);
  const router = useRouter();

  const agregarOpcion = () => {
    if (nuevaOpcion.trim() !== "") {
      setOpciones([...opciones, nuevaOpcion.trim()]);
      setNuevaOpcion("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      console.error("❌ Usuario no autenticado.");
      return;
    }

    const user = JSON.parse(storedUser);
    const bodaId = user.bodaId;

    if (!bodaId || opciones.length < 2) {
      console.error("❌ Faltan opciones o bodaId inválido.");
      return;
    }

    try {
      await axiosInstance.post("/preguntas", {
        bodaId,
        pregunta,
        opciones,
        esObligatoria,
        esConfirmacionAsistencia,
        filtros: {}, // puedes aplicar lógica aquí más adelante
      });

      router.push(`/dashboard/preguntas/${bodaId}/preguntasLista`);
    } catch (error: any) {
      console.error("❌ Error al crear pregunta:", error?.response?.data?.message || error.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">➕ Crear Nueva Pregunta</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Escribe la pregunta"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <div>
          <label className="block mb-2 font-medium">Opciones:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Añadir opción"
              value={nuevaOpcion}
              onChange={(e) => setNuevaOpcion(e.target.value)}
              className="flex-grow border p-2 rounded"
            />
            <button
              type="button"
              onClick={agregarOpcion}
              className="bg-gray-700 text-white px-3 py-2 rounded"
            >
              ➕ Añadir
            </button>
          </div>

          {opciones.length > 0 && (
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
              {opciones.map((op, idx) => (
                <li key={idx}>{op}</li>
              ))}
            </ul>
          )}
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={esObligatoria}
            onChange={(e) => setEsObligatoria(e.target.checked)}
          />
          <span>¿Es obligatoria?</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={esConfirmacionAsistencia}
            onChange={(e) => setEsConfirmacionAsistencia(e.target.checked)}
          />
          <span>¿Es una pregunta de confirmación de asistencia?</span>
        </label>

        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          ✅ Guardar Pregunta
        </button>
      </form>
    </div>
  );
}
