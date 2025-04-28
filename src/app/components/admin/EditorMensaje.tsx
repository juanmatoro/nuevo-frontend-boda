"use client";

import { useState, useEffect } from "react";
import {
  obtenerPlantillas,
  crearPlantilla,
} from "@/services/plantillasService";
import toast from "react-hot-toast";

type Props = {
  mensaje: string;
  onMensajeChange: (mensaje: string) => void;
};

export default function EditorMensaje({ mensaje, onMensajeChange }: Props) {
  const [mensajeLocal, setMensajeLocal] = useState(mensaje);
  const [plantillas, setPlantillas] = useState<string[]>([]);
  const [nombrePlantilla, setNombrePlantilla] = useState<string>("");

  // Sincroniza mensaje externo → interno
  useEffect(() => {
    setMensajeLocal(mensaje);
  }, [mensaje]);

  // Cargar plantillas
  useEffect(() => {
    const fetchPlantillas = async () => {
      try {
        const data = await obtenerPlantillas();
        if (
          Array.isArray(data) &&
          data.every((item) => typeof item === "string")
        ) {
          setPlantillas(data);
        } else {
          console.warn("❌ Plantillas inválidas recibidas:", data);
          toast.error("No se pudieron cargar las plantillas");
        }
      } catch (error) {
        console.error("❌ Error al cargar plantillas:", error);
        toast.error("Error al cargar plantillas");
      }
    };

    fetchPlantillas();
  }, []);

  // Cambiar mensaje
  const handleMensajeChange = (value: string) => {
    setMensajeLocal(value);
    onMensajeChange(value);
  };

  // Aplicar plantilla
  const aplicarPlantilla = (texto: string) => {
    setMensajeLocal(texto);
    onMensajeChange(texto);
  };

  // Guardar plantilla
  const guardarPlantilla = async () => {
    const nombre = nombrePlantilla.trim();
    if (!nombre) {
      toast.error("Debes escribir un nombre para la plantilla");
      return;
    }

    try {
      await crearPlantilla(nombre, mensajeLocal);
      toast.success("💾 Plantilla guardada");
      setPlantillas((prev) => [...prev, nombre]);
      setNombrePlantilla("");
    } catch (error) {
      console.error("❌ Error al guardar plantilla:", error);
      toast.error("No se pudo guardar la plantilla");
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded shadow-sm bg-white">
      <h3 className="text-lg font-semibold">✍️ Editor de Mensaje</h3>

      <textarea
        className="w-full border p-2 rounded min-h-[100px]"
        placeholder="Escribe el mensaje aquí..."
        value={mensajeLocal}
        onChange={(e) => handleMensajeChange(e.target.value)}
      />

      {plantillas.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {plantillas.map((texto, index) => (
            <button
              key={index}
              onClick={() => aplicarPlantilla(texto)}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border text-sm"
              title="Aplicar plantilla"
            >
              📋 {texto.slice(0, 25)}...
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Nombre de la nueva plantilla"
          value={nombrePlantilla}
          onChange={(e) => setNombrePlantilla(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={guardarPlantilla}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
        >
          💾 Guardar
        </button>
      </div>
    </div>
  );
}
