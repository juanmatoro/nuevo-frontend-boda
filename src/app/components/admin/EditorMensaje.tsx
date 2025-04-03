"use client";

import { useState, useEffect } from "react";
import {
  obtenerPlantillas,
  crearPlantilla,
} from "@/services/plantillasService";
import toast from "react-hot-toast";

interface Props {
  onMensajeChange: (mensaje: string) => void;
}

export default function EditorMensaje({ onMensajeChange }: Props) {
  const [mensaje, setMensaje] = useState("");
  const [plantillas, setPlantillas] = useState<string[]>([]);
  const [nuevaPlantilla, setNuevaPlantilla] = useState("");

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
          console.error("❌ Datos inválidos recibidos:", data);
          toast.error("No se pudieron cargar las plantillas");
        }
      } catch (error) {
        console.error("❌ Error al cargar plantillas:", error);
        toast.error("No se pudieron cargar las plantillas");
      }
    };
    fetchPlantillas();
  }, []);

  const handleMensajeChange = (value: string) => {
    setMensaje(value);
    onMensajeChange(value);
  };

  const aplicarPlantilla = (texto: string) => {
    setMensaje(texto);
    onMensajeChange(texto);
  };

  const guardarPlantilla = async () => {
    if (!nuevaPlantilla.trim()) return;
    try {
      await crearPlantilla(nuevaPlantilla.trim(), mensaje);
      toast.success("💾 Plantilla guardada");
      setPlantillas((prev) => [...prev, nuevaPlantilla.trim()]);
      setNuevaPlantilla("");
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
        value={mensaje}
        onChange={(e) => handleMensajeChange(e.target.value)}
      />

      <div className="flex gap-4 flex-wrap">
        {plantillas.map((texto, index) => (
          <button
            key={index}
            onClick={() => aplicarPlantilla(texto)}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border text-sm"
          >
            📋 {texto.slice(0, 25)}...
          </button>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Guardar mensaje como plantilla"
          value={nuevaPlantilla}
          onChange={(e) => setNuevaPlantilla(e.target.value)}
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
