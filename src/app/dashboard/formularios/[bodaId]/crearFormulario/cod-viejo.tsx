"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 📌 **Definir interfaces**
interface Pregunta {
  _id: string;
  pregunta: string;
}

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
}

// 📌 **Definir esquema de validación con Zod**
const formularioSchema = z.object({
  preguntas: z.array(z.string()).min(1, "Debes seleccionar al menos una pregunta"),
  invitados: z.array(z.string()).min(1, "Debes seleccionar al menos un invitado"),
});

// 📌 **Tipo del formulario basado en el esquema de Zod**
type FormularioData = z.infer<typeof formularioSchema>;

export default function CrearFormulario() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const router = useRouter();
  
  const { control, handleSubmit, setValue } = useForm<FormularioData>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      preguntas: [],
      invitados: [],
    },
  });

  // 📌 **Obtener preguntas e invitados al cargar el componente**
  useEffect(() => {
    const fetchDatos = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
  
      if (!token || !user.bodaId) {
        console.error("❌ Usuario no autenticado o bodaId no encontrado.");
        return;
      }
  
      try {
        const [pregResp, invResp] = await Promise.all([
          fetch(`http://localhost:4000/api/forms/questions/${user.bodaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:4000/api/guests/invitados/${user.bodaId}?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        const preguntasData = await pregResp.json();
        const invitadosData = await invResp.json();
  
        console.log("📌 Preguntas recibidas:", preguntasData);
        console.log("📌 Invitados recibidos:", invitadosData);
  
        // ✅ Extraer solo el array de invitados
        setPreguntas(Array.isArray(preguntasData) ? preguntasData : []);
        setInvitados(Array.isArray(invitadosData.invitados) ? invitadosData.invitados : []);
  
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
        setPreguntas([]);
        setInvitados([]);
      }
    };
  
    fetchDatos();
  }, []);

  
  // 📌 **Enviar formulario al backend**
  const onSubmit = async (data: FormularioData) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user.bodaId) {
      console.error("❌ Usuario no autenticado o bodaId no encontrado.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/forms/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bodaId: user.bodaId,
          enviadosA: data.invitados,
          preguntas: data.preguntas,
        }),
      });

      if (!response.ok) throw new Error("Error al crear formulario");

      router.push(`/dashboard/formularios/${user.bodaId}`);
    } catch (error) {
      console.error("❌ Error al crear formulario:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Crear Nuevo Formulario</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border p-6 rounded-lg shadow-lg">
        {/* Selección de preguntas */}
        <div>
          <label className="block font-semibold mb-2">📌 Selecciona las preguntas:</label>
          <Controller
            name="preguntas"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                {preguntas.length > 0 ? (
                  preguntas.map((p) => (
                    <label key={p._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={p._id}
                        checked={field.value.includes(p._id)}
                        onChange={(e) =>
                          setValue(
                            "preguntas",
                            e.target.checked
                              ? [...field.value, p._id]
                              : field.value.filter((id) => id !== p._id)
                          )
                        }
                        className="mr-2"
                      />
                      {p.pregunta}
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500">No hay preguntas disponibles.</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Selección de invitados */}
        <div>
          <label className="block font-semibold mb-2">🎉 Selecciona los invitados:</label>
          <Controller
            name="invitados"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                {invitados.length > 0 ? (
                  invitados.map((i) => (
                    <label key={i._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={i._id}
                        checked={field.value.includes(i._id)}
                        onChange={(e) =>
                          setValue(
                            "invitados",
                            e.target.checked
                              ? [...field.value, i._id]
                              : field.value.filter((id) => id !== i._id)
                          )
                        }
                        className="mr-2"
                      />
                      {i.nombre} ({i.telefono})
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500">No hay invitados disponibles.</p>
                )}
              </div>
            )}
          />
        </div>

        {/* Botón de enviar */}
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          ✅ Crear Formulario
        </button>
      </form>
    </div>
  );
}
