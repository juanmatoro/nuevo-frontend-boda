// src/app/components/admin/MensajeProgramadoForm.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { scheduleMessage } from "@/services/mensajesService";

interface Props {
  modoEnvio: "individual" | "lista";
  telefono: string;
  nombreLista: string;
}

export default function MensajeProgramadoForm({
  modoEnvio,
  telefono,
  nombreLista,
}: Props) {
  const [mensaje, setMensaje] = useState("");
  const [fecha, setFecha] = useState("");

  const handleProgramar = async () => {
    if (!mensaje || !fecha) {
      toast.error("Mensaje y fecha son obligatorios");
      return;
    }

    try {
      if (modoEnvio === "individual" && telefono) {
        await scheduleMessage(telefono, mensaje, fecha);
        toast.success("📅 Mensaje programado para el invitado");
      } else if (modoEnvio === "lista" && nombreLista) {
        // Enviar a todos los invitados de la lista (si se implementa)
        toast("Funcionalidad aún no disponible para listas");
      } else {
        toast.error("Faltan datos para programar el mensaje");
      }

      setMensaje("");
      setFecha("");
    } catch (error) {
      console.error("❌ Error al programar mensaje:", error);
      toast.error("Error al programar el mensaje");
    }
  };

  return (
    <div className="border-t border-gray-300 pt-6 mt-6">
      <h3 className="text-lg font-bold text-pink-800 mb-4">
        ⏰ Programar mensajes automáticos
      </h3>

      <div className="border p-4 rounded space-y-4">
        <div>
          <label className="block font-semibold mb-1">Mensaje</label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="border w-full p-2 rounded"
            placeholder="Mensaje a programar..."
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Fecha y Hora de Envío
          </label>
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border w-full p-2 rounded"
          />
        </div>

        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          onClick={handleProgramar}
        >
          📬 Programar Mensaje
        </button>
      </div>
    </div>
  );
}
