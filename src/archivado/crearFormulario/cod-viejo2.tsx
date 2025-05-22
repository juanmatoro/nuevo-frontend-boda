"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 📌 Interfaces
interface Pregunta {
  _id: string;
  pregunta: string;
}

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
}

interface ListaDifusion {
  _id: string;
  nombre: string;
}

// 📌 Esquema de validación con Zod
const formularioSchema = z.object({
  nombreFormulario: z.string().min(1, "El nombre del formulario es obligatorio"),
  preguntas: z.array(z.string()).min(1, "Debes seleccionar al menos una pregunta"),
  modoEnvio: z.enum(["individuales", "lista"]),
  invitados: z.array(z.string()).optional(),
  listaId: z.string().optional(),
});

type FormularioData = z.infer<typeof formularioSchema>;

export default function CrearFormulario() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [listas, setListas] = useState<ListaDifusion[]>([]);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormularioData>({
    resolver: zodResolver(formularioSchema),
    defaultValues: {
      nombreFormulario: "",
      preguntas: [],
      modoEnvio: "individuales",
      invitados: [],
      listaId: "",
    },
  });

  const modoEnvio = watch("modoEnvio");

  useEffect(() => {
    const fetchDatos = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user.bodaId) return;

      try {
        const [pregResp, invResp, listaResp] = await Promise.all([
          fetch(`http://localhost:4000/api/forms/questions/${user.bodaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:4000/api/guests/invitados/${user.bodaId}?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:4000/api/lists/${user.bodaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const preguntasData = await pregResp.json();
        const invitadosData = await invResp.json();
        const listasData = await listaResp.json();

        setPreguntas(Array.isArray(preguntasData) ? preguntasData : []);
        setInvitados(Array.isArray(invitadosData.invitados) ? invitadosData.invitados : []);
        setListas(Array.isArray(listasData) ? listasData : []);
      } catch (error) {
        console.error("❌ Error al obtener datos:", error);
      }
    };

    fetchDatos();
  }, []);

  const onSubmit = async (data: FormularioData) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user.bodaId) return;

    const payload: any = {
      bodaId: user.bodaId,
      preguntas: data.preguntas,
      nombreFormulario: data.nombreFormulario,
    };

    if (data.modoEnvio === "individuales") {
      payload.enviadosA = data.invitados;
    } else {
      payload.listaId = data.listaId;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al crear formulario");
      router.push(`/dashboard/formularios/${user.bodaId}`);
    } catch (error) {
      console.error("❌ Error al enviar formulario:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📝 Crear Formulario</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border p-6 rounded-lg shadow-lg">
        {/* Nombre del formulario */}
        <div>
          <label className="block font-semibold mb-1">📌 Nombre del formulario:</label>
          <Controller
            name="nombreFormulario"
            control={control}
            render={({ field }) => (
              <input {...field} className="w-full border p-2 rounded" placeholder="Ej: Confirmación de asistencia" />
            )}
          />
          {errors.nombreFormulario && <p className="text-red-500">{errors.nombreFormulario.message}</p>}
        </div>

        {/* Preguntas */}
        <div>
          <label className="block font-semibold mb-2">❓ Selecciona preguntas:</label>
          <Controller
            name="preguntas"
            control={control}
            render={({ field }) => (
              <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded">
                {preguntas.map((p) => (
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
                    />
                    <span>{p.pregunta}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </div>

        {/* Modo de envío */}
        <div>
          <label className="block font-semibold mb-2">📤 Enviar formulario a:</label>
          <Controller
            name="modoEnvio"
            control={control}
            render={({ field }) => (
              <select {...field} className="w-full border p-2 rounded">
                <option value="individuales">Invitados seleccionados</option>
                <option value="lista">Lista de difusión</option>
              </select>
            )}
          />
        </div>

        {/* Invitados seleccionados */}
        {modoEnvio === "individuales" && (
          <div>
            <label className="block font-semibold mb-2">🎉 Selecciona invitados:</label>
            <Controller
              name="invitados"
              control={control}
              render={({ field }) => (
                <select
                  multiple
                  className="w-full border p-2 rounded h-40"
                  value={field.value}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                    setValue("invitados", selected);
                  }}
                >
                  {invitados.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.nombre} ({i.telefono})
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}

        {/* Lista de difusión */}
        {modoEnvio === "lista" && (
          <div>
            <label className="block font-semibold mb-2">📢 Selecciona la lista de difusión:</label>
            <Controller
              name="listaId"
              control={control}
              render={({ field }) => (
                <select {...field} className="w-full border p-2 rounded">
                  <option value="">-- Selecciona una lista --</option>
                  {listas.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.nombre}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}

        {/* Enviar */}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          ✅ Crear Formulario
        </button>
      </form>
    </div>
  );
}
