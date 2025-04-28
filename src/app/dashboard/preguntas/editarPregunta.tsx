"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditarPreguntaPage() {
  const router = useRouter();
  const { id } = useParams();
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState<string[]>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [esObligatoria, setEsObligatoria] = useState(false);

  useEffect(() => {
    const fetchPregunta = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:4000/api/forms/questions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setPregunta(data.pregunta);
        setOpciones(data.opciones || []);
        setEsObligatoria(data.esObligatoria);
      } catch (error) {
        console.error("❌ Error al cargar la pregunta:", error);
      }
    };

    if (id) fetchPregunta();
  }, [id]);

  const agregarOpcion = () => {
    if (nuevaOpcion.trim() !== "") {
      setOpciones([...opciones, nuevaOpcion]);
      setNuevaOpcion("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/api/forms/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pregunta, opciones, esObligatoria }),
      });

      if (response.ok) {
        router.push("/dashboard/noviosDashboard/formularios");
      }
    } catch (error) {
      console.error("❌ Error al actualizar pregunta:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">✏️ Editar Pregunta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <div>
          <input
            type="text"
            placeholder="Añadir opción"
            value={nuevaOpcion}
            onChange={(e) => setNuevaOpcion(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button type="button" onClick={agregarOpcion} className="bg-gray-500 text-white px-2 py-1 rounded">
            ➕ Añadir
          </button>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          ✅ Guardar Cambios
        </button>
      </form>
    </div>
  );
}
