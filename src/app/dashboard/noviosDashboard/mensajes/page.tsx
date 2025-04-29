"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import EditorMensaje from "@/app/components/admin/EditorMensaje";
import MensajeProgramadoForm from "@/app/components/admin/MensajeProgramado";
import { getAllGuestsByBoda } from "@/services/invitadosSercice";
import { getBroadcastListsByBoda as getBroadcastListsService } from "@/services/broadcastService";
import {
  sendDirectMessage,
  sendBroadcastMessage,
  iniciarSesionWhatsApp,
  obtenerEstadoSesion,
} from "@/services/mensajesService";
import Select from "react-select";

export default function MensajesPage() {
  const [mensaje, setMensaje] = useState("");
  const [modoEnvio, setModoEnvio] = useState<"individual" | "lista">(
    "individual"
  );
  const [invitadoId, setInvitadoId] = useState("");
  const [telefono, setTelefono] = useState("");
  const [listaId, setListaId] = useState("");
  const [listas, setListas] = useState<any[]>([]);
  const [invitados, setInvitados] = useState<any[]>([]);
  const [invitadosOptions, setInvitadosOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [estadoSesion, setEstadoSesion] = useState<string>("CONECTANDO");
  const [mensajeSesion, setMensajeSesion] = useState<string>(
    "Verificando sesión..."
  );
  const [cargandoSesion, setCargandoSesion] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarBanner, setMostrarBanner] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    cargarDatos();
    verificarEstadoSesion();

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const options = invitados.map((i) => ({
      value: i._id,
      label: `${i.nombre} - ${i.telefono}`,
    }));
    setInvitadosOptions(options);
  }, [invitados]);

  const cargarDatos = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.bodaId) return;

    try {
      const invitadosData = (await getAllGuestsByBoda(user.bodaId)) as {
        invitados: any[];
      };
      const listasData = await getBroadcastListsService(user.bodaId);
      setInvitados(invitadosData.invitados || []);
      setListas(listasData || []);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      toast.error("Error al cargar invitados o listas");
    }
  };

  const iniciarPolling = () => {
    if (!pollingRef.current) {
      pollingRef.current = setTimeout(() => {
        verificarEstadoSesion();
        pollingRef.current = null;
      }, 5000);
    }
  };

  const verificarEstadoSesion = async () => {
    try {
      const data = await obtenerEstadoSesion();

      if (data?.estado) {
        setEstadoSesion(data.estado);

        switch (data.estado) {
          case "CONNECTED":
            setMensajeSesion("✅ Conectado a WhatsApp");
            setMostrarBanner(false);
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;

          case "RECONNECTING":
          case "DISCONNECTED":
            setMensajeSesion("♻️ Intentando reconectar...");
            setMostrarBanner(true);
            iniciarPolling();
            break;

          case "NEEDS_QR":
            setMensajeSesion("📲 Escanea el QR para reconectar");
            setMostrarBanner(true);
            break;

          default:
            setMensajeSesion("⏳ Verificando sesión...");
            setMostrarBanner(true);
            iniciarPolling();
        }
      }
    } catch (error) {
      console.error("❌ Error al verificar estado:", error);
      setEstadoSesion("ERROR");
      setMensajeSesion("Error al obtener estado de sesión");
    }
  };

  const handleIniciarSesion = async () => {
    setCargandoSesion(true);
    try {
      await iniciarSesionWhatsApp();
      toast.success("✅ Sesión iniciada correctamente");
      await verificarEstadoSesion();
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      toast.error("No se pudo iniciar la sesión");
      setEstadoSesion("ERROR");
      setMensajeSesion("❌ Error al iniciar sesión");
    } finally {
      setCargandoSesion(false);
    }
  };

  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return;
    }

    setEnviando(true);
    toast.loading("Conectando a WhatsApp...");

    try {
      if (modoEnvio === "individual") {
        if (!invitadoId) {
          toast.error("Selecciona un invitado");
          return;
        }
        await sendDirectMessage(telefono, mensaje);
        toast.success("📤 Mensaje enviado al invitado");
        // Limpiar también el invitadoId y el teléfono en el envío individual
        setInvitadoId("");
        setTelefono("");
      } else {
        if (!listaId) {
          toast.error("Selecciona una lista de difusión");
          return;
        }
        await sendBroadcastMessage(listaId, mensaje);
        toast.success("📢 Mensaje enviado a la lista de difusión");
        await cargarDatos();
        // No limpiamos invitadoId ni teléfono en el envío a lista
        setListaId("");
      }

      // Limpiar el mensaje en ambos casos
      setMensaje("");
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error);
      toast.error("No se pudo enviar el mensaje");
    } finally {
      setEnviando(false);
      toast.dismiss();
    }
  };

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">📨 Enviar Mensajes</h2>

      {/* 🟡 Banner reconexión */}
      {mostrarBanner && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded border border-yellow-300 shadow">
          {mensajeSesion}
        </div>
      )}

      {/* Estado sesión y botón */}
      <div className="border p-4 rounded bg-gray-50 space-y-2">
        <h3 className="text-lg font-semibold">📲 Sesión de WhatsApp</h3>
        <p>
          <span className="font-medium">Estado actual:</span>{" "}
          <span
            className={`font-semibold ${
              estadoSesion === "CONNECTED"
                ? "text-green-600"
                : estadoSesion === "ERROR"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {mensajeSesion}
          </span>
        </p>
        <button
          className={`px-4 py-2 rounded text-white ${
            cargandoSesion ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={handleIniciarSesion}
          disabled={cargandoSesion}
        >
          {cargandoSesion ? "Conectando..." : "🔄 Iniciar sesión de WhatsApp"}
        </button>
      </div>

      {/* Selector de modo */}
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

      {/* Selector dinámico */}
      {modoEnvio === "individual" ? (
        <div>
          <label className="block font-semibold mb-1">📱 Invitado</label>
          <Select
            value={invitadosOptions.find(
              (option) => option.value === invitadoId
            )}
            onChange={(selectedOption) => {
              const id = selectedOption?.value;
              setInvitadoId(id || "");
              const invitado = invitados.find((i) => i._id === id);
              setTelefono(invitado?.telefono || "");
            }}
            options={invitadosOptions}
            placeholder="Buscar invitado..."
            isSearchable
          />
        </div>
      ) : (
        <div>
          <label className="block font-semibold mb-1">
            📝 Lista de difusión
          </label>
          <select
            value={listaId}
            onChange={(e) => setListaId(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Selecciona una lista</option>
            {listas.map((l) => (
              <option key={l._id} value={l._id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Editor */}
      <EditorMensaje mensaje={mensaje} onMensajeChange={setMensaje} />

      {/* Botón de envío */}
      <button
        className={`px-6 py-2 rounded text-white ${
          enviando ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
        onClick={handleEnviar}
        disabled={enviando}
      >
        {enviando ? "Enviando..." : "🚀 Enviar Mensaje"}
      </button>

      {/* Programación */}
      <MensajeProgramadoForm
        modoEnvio={modoEnvio}
        invitadoId={invitadoId}
        nombreLista={listas.find((l) => l._id === listaId)?.nombre || ""}
      />
    </div>
  );
}
