"use client";

import { useState } from "react";
import { Question } from "@/interfaces/preguntas";
import type { Invitado } from "@/interfaces/invitado";
import { filtrarInvitadosPorRespuesta } from "@/services/invitadosSercice";
import { crearListaDifusion } from "@/services/broadcastService";
import toast from "react-hot-toast";

interface Props {
  preguntas: Question[];
  bodaId: string;
  onFiltrar: (invitados: Invitado[]) => void;
}

export default function FiltroDeInvitados({
  preguntas,
  bodaId,
  onFiltrar,
}: Props) {
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState("");
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState("");

  // 🎯 Obtener opciones basadas en la pregunta seleccionada
  const opcionesRespuesta =
    preguntas.find((p) => p._id === preguntaSeleccionada)?.opciones || [];

  const handleFiltrar = async () => {
    if (!preguntaSeleccionada || !respuestaSeleccionada) {
      toast.error("Selecciona una pregunta y una respuesta");
      return;
    }

    try {
      const data = await filtrarInvitadosPorRespuesta(
        preguntaSeleccionada,
        respuestaSeleccionada
      );

      if (data?.length > 0) {
        toast.success(`🎯 Se encontraron ${data.length} invitados`);
        onFiltrar(data);
      } else {
        toast("😕 No se encontraron invitados con esa respuesta");
        onFiltrar([]);
      }
    } catch (error) {
      console.error("❌ Error al filtrar invitados:", error);
      toast.error("Hubo un error al filtrar invitados");
    }
  };

  const handleCrearLista = async () => {
    if (!preguntaSeleccionada || !respuestaSeleccionada) {
      toast.error("Selecciona una pregunta y una respuesta");
      return;
    }

    const preguntaTexto =
      preguntas.find((p) => p._id === preguntaSeleccionada)?.pregunta || "";

    if (!preguntaTexto.trim()) {
      toast.error(
        "No se pudo generar el nombre de la lista. Revisa la pregunta."
      );
      return;
    }

    const nombreLista = `${preguntaTexto} - ${respuestaSeleccionada}`;

    try {
      const data = await filtrarInvitadosPorRespuesta(
        preguntaSeleccionada,
        respuestaSeleccionada
      );

      const invitadosIds = data.map((i: Invitado) => i._id);
      if (invitadosIds.length === 0) {
        toast.error("No hay invitados para crear la lista");
        return;
      }

      await crearListaDifusion(nombreLista, invitadosIds);
      toast.success(`✅ Lista creada con éxito`, {
        duration: 6000,
        style: {
          background: "#4ade80", // verde
          color: "#000",
          fontWeight: "bold",
        },
      });
    } catch (error) {
      console.error("❌ Error al crear lista:", error);
      toast.error("Error al crear la lista de difusión");
    }
  };

  if (!preguntas || preguntas.length === 0) {
    return (
      <p className="text-red-500 my-4">
        ⚠️ No hay preguntas disponibles para aplicar filtros.
      </p>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded p-6 mb-6 space-y-4 shadow">
      <h3 className="text-lg font-bold text-gray-800">
        🎯 Filtrar por respuesta
      </h3>

      <div className="flex flex-col md:flex-row gap-4">
        <select
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2"
          value={preguntaSeleccionada}
          onChange={(e) => {
            setPreguntaSeleccionada(e.target.value);
            setRespuestaSeleccionada("");
          }}
        >
          <option value="">Selecciona una pregunta</option>
          {preguntas.map((p) => (
            <option key={p._id} value={p._id}>
              {p.pregunta}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2"
          value={respuestaSeleccionada}
          onChange={(e) => setRespuestaSeleccionada(e.target.value)}
          disabled={!preguntaSeleccionada}
        >
          <option value="">Selecciona una respuesta</option>
          {opcionesRespuesta.map((op, idx) => (
            <option key={idx} value={op}>
              {op}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          onClick={handleFiltrar}
        >
          🔍 Filtrar invitados
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          onClick={handleCrearLista}
        >
          📝 Crear lista con resultado
        </button>
      </div>
    </div>
  );
}
