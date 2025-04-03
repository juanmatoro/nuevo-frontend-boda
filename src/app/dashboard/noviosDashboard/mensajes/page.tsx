"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import EditorMensaje from "@/app/components/admin/EditorMensaje";
import MensajeProgramadoForm from "@/app/components/admin/MensajeProgramado";
import { getInvitadosByBoda } from "@/services/invitadosSercice";
import { getBroadcastListsByBoda } from "@/services/broadcastService";
import {
  sendDirectMessage,
  sendBroadcastMessage,
} from "@/services/mensajesService";

export default function MensajesPage() {
  const [mensaje, setMensaje] = useState("");
  const [modoEnvio, setModoEnvio] = useState<"individual" | "lista">(
    "individual"
  );
  const [telefono, setTelefono] = useState("");
  const [nombreLista, setNombreLista] = useState("");
  const [invitados, setInvitados] = useState<any[]>([]);
  const [listas, setListas] = useState<any[]>([]);
  const [bodaId, setBodaId] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.bodaId) setBodaId(user.bodaId);

    const fetchData = async () => {
      try {
        if (user?.bodaId) {
          const invitadosData = (await getInvitadosByBoda(user.bodaId)) as {
            invitados: any[];
          };
          const listasData = await getBroadcastListsByBoda(user.bodaId);
          setInvitados(invitadosData.invitados || []);
          setListas(listasData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, []);

  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return;
    }

    try {
      if (modoEnvio === "individual") {
        if (!telefono) {
          toast.error("Selecciona un invitado");
          return;
        }
        await sendDirectMessage(telefono, mensaje);
        toast.success("📤 Mensaje enviado al invitado");
      } else {
        if (!nombreLista) {
          toast.error("Selecciona una lista de difusión");
          return;
        }
        await sendBroadcastMessage(nombreLista, mensaje);
        toast.success("📢 Mensaje enviado a la lista de difusión");
      }

      setMensaje("");
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
      toast.error("No se pudo enviar el mensaje");
    }
  };

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">📨 Enviar Mensajes</h2>

      {/* Selector de modo de envío */}
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded ${
            modoEnvio === "individual"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setModoEnvio("individual")}
        >
          👤 Invitado individual
        </button>
        <button
          className={`px-4 py-2 rounded ${
            modoEnvio === "lista" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setModoEnvio("lista")}
        >
          📋 Lista de difusión
        </button>
      </div>

      {/* Input dinámico según modo */}
      {modoEnvio === "individual" ? (
        <div>
          <label className="block font-semibold mb-1">📱 Invitado</label>
          <select
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Selecciona un invitado</option>
            {invitados.map((i) => (
              <option key={i._id} value={i.telefono}>
                {i.nombre} - {i.telefono}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block font-semibold mb-1">
            📝 Lista de difusión
          </label>
          <select
            value={nombreLista}
            onChange={(e) => setNombreLista(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Selecciona una lista</option>
            {listas.map((l) => (
              <option key={l._id} value={l.nombre}>
                {l.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Editor con plantillas */}
      <EditorMensaje onMensajeChange={setMensaje} />

      <button
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        onClick={handleEnviar}
      >
        🚀 Enviar Mensaje
      </button>

      {/* Programador de mensajes con contexto de modo actual */}
      <MensajeProgramadoForm
        modoEnvio={modoEnvio}
        telefono={telefono}
        nombreLista={nombreLista}
      />
    </div>
  );
}
