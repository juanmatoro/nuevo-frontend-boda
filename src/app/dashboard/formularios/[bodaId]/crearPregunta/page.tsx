"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CrearPreguntaPage() {
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState<string[]>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [esObligatoria, setEsObligatoria] = useState(false);
  const router = useRouter();

  const agregarOpcion = () => {
    if (nuevaOpcion.trim() !== "") {
      setOpciones([...opciones, nuevaOpcion]);
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

    try {
      const response = await fetch("http://localhost:4000/api/forms/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bodaId, pregunta, opciones, esObligatoria }),
      });

      if (response.ok) {
        router.push(`/dashboard/formularios/${bodaId}`);
      }
    } catch (error) {
      console.error("❌ Error al crear pregunta:", error);
    }
  };

  return (
    <div className="p-6">
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
          <input
            type="text"
            placeholder="Añadir opción"
            value={nuevaOpcion}
            onChange={(e) => setNuevaOpcion(e.target.value)}
            className="w-full border p-2 rounded"
          />
         {/*  <button type="button" onClick={agregarOpcion} className="bg-gray-500 text-white px-2 py-1 rounded">
            ➕ Añadir
          </button> */}
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          ✅ Guardar Pregunta
        </button>
      </form>
    </div>
  );
}
