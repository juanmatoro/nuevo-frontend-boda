"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const responseSchema = z.object({
  preguntaId: z.string().min(1, "Debe seleccionar una pregunta"),
  respuesta: z.string().min(1, "Debe elegir una opción válida"),
});

type ResponseFormData = z.infer<typeof responseSchema>;

export default function ResponderFormulario() {
  const [preguntas, setPreguntas] = useState<{ _id: string; pregunta: string; opciones: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
  });

  // 📌 Obtener preguntas desde el backend
  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) return;
        const user = JSON.parse(storedUser);
        const bodaId = user.bodaId;

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

  // 📌 Manejar envío del formulario
  const onSubmit = async (data: ResponseFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/api/forms/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Respuesta enviada correctamente.");
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error al enviar la respuesta:", error);
      setMessage("❌ Error en la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">📝 Responder Formulario</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="font-semibold">Selecciona una pregunta:</span>
          <select {...register("preguntaId")} className="w-full p-2 border rounded mt-2">
            <option value="">-- Selecciona una pregunta --</option>
            {preguntas.map((pregunta) => (
              <option key={pregunta._id} value={pregunta._id}>
                {pregunta.pregunta}
              </option>
            ))}
          </select>
          {errors.preguntaId && <p className="text-red-500">{errors.preguntaId.message}</p>}
        </label>

        <label className="block">
          <span className="font-semibold">Selecciona tu respuesta:</span>
          <select {...register("respuesta")} className="w-full p-2 border rounded mt-2">
            <option value="">-- Selecciona una opción --</option>
            {preguntas
              .find((p) => p._id === document.querySelector("select")?.value)
              ?.opciones.map((opcion, index) => (
                <option key={index} value={opcion}>
                  {opcion}
                </option>
              ))}
          </select>
          {errors.respuesta && <p className="text-red-500">{errors.respuesta.message}</p>}
        </label>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? "Enviando..." : "✅ Enviar Respuesta"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
