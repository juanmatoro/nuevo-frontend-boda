"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { getAllGuestsByBoda } from "@/services/invitadosSercice";
import { getBroadcastListsByBoda as getBroadcastListsService } from "@/services/broadcastService";
import {
  sendDirectMessage,
  sendBroadcastMessage,
  iniciarSesionWhatsApp,
  obtenerEstadoSesion,
  logoutWhatsApp,
} from "@/services/whatsappLocalService";

// Componentes de la UI
import EditorMensaje from "@/app/components/admin/EditorMensaje";
import EnviarInvitacionModal from "@/app/components/admin/EnviarInvitacionModal"; // ▼▼▼ NUEVO/MODIFICADO ▼▼▼

// Interfaces
interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
}

interface ListaDifusion {
  _id: string;
  nombre: string;
  invitados: Invitado[];
}

// Función de Normalización de Teléfonos (la mantengo aquí como en tu original)
function normalizePhoneNumber(
  phoneNumber: string,
  defaultCountryCode: string = "34"
): string {
  if (!phoneNumber || typeof phoneNumber !== "string") return "";
  let cleaned = phoneNumber.trim().replace(/[\s-()]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
    return /^\d+$/.test(cleaned) ? cleaned : "";
  }
  if (cleaned.startsWith("00" + defaultCountryCode)) {
    const numberPart = cleaned.substring(2 + defaultCountryCode.length);
    return /^\d+$/.test(defaultCountryCode + numberPart)
      ? defaultCountryCode + numberPart
      : "";
  }
  if (cleaned.startsWith(defaultCountryCode)) {
    return /^\d+$/.test(cleaned) ? cleaned : "";
  }
  if (
    defaultCountryCode === "34" &&
    cleaned.length === 9 &&
    /^[6789]\d{8}$/.test(cleaned)
  ) {
    return defaultCountryCode + cleaned;
  }
  return /^\d+$/.test(cleaned) ? cleaned : "";
}

export default function MensajesPage() {
  // --- Estados para envío de mensajes ad-hoc (tu lógica actual) ---
  const [mensaje, setMensaje] = useState("");
  const [modoEnvio, setModoEnvio] = useState<"individual" | "lista">(
    "individual"
  );
  const [invitadoId, setInvitadoId] = useState("");
  const [telefono, setTelefono] = useState("");
  const [listaSeleccionadaId, setListaSeleccionadaId] = useState("");
  const [listasDifusion, setListasDifusion] = useState<ListaDifusion[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [invitadosOptions, setInvitadosOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // --- Estados para la gestión de la sesión de WhatsApp (tu lógica actual) ---
  const [estadoSesion, setEstadoSesion] = useState<string>("CONECTANDO");
  const [mensajeSesion, setMensajeSesion] = useState<string>(
    "Verificando sesión..."
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ▼▼▼ NUEVO/MODIFICADO ▼▼▼ Estado para controlar el modal de invitaciones y guardar bodaId
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [bodaId, setBodaId] = useState<string>("");

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      if (user?.bodaId) {
        setBodaId(user.bodaId); // Guardamos bodaId en el estado para pasarlo al modal
        cargarDatosIniciales(user.bodaId);
      } else {
        toast.error(
          "ID de boda no encontrado. Asegúrate de haber iniciado sesión correctamente."
        );
      }
    }
    verificarEstadoSesion();
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    const options = invitados.map((i) => ({
      value: i._id,
      label: `${i.nombre} - ${i.telefono || "Sin teléfono"}`,
    }));
    setInvitadosOptions(options);
  }, [invitados]);

  const cargarDatosIniciales = async (bodaId: string) => {
    try {
      const invitadosData = await getAllGuestsByBoda(bodaId);
      setInvitados(invitadosData.invitados || []);
      const listasData = await getBroadcastListsService(bodaId);
      setListasDifusion(listasData || []);
    } catch (error) {
      console.error("❌ Error al cargar datos iniciales:", error);
      toast.error("Error al cargar invitados o listas de difusión.");
    }
  };

  const iniciarPolling = () => {
    if (pollingRef.current) clearTimeout(pollingRef.current);
    pollingRef.current = setTimeout(() => verificarEstadoSesion(), 7000);
  };

  const verificarEstadoSesion = async () => {
    /* ... Tu lógica existente no cambia ... */
    try {
      const data = await obtenerEstadoSesion();
      if (data?.estado) {
        setEstadoSesion(data.estado);
        setQrCodeUrl(data.qr || null);
        let newMensajeSesion = "";
        switch (data.estado) {
          case "CONNECTED":
            newMensajeSesion = "✅ Conectado a WhatsApp";
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;
          case "NEEDS_QR":
            newMensajeSesion = "📲 Escanea el QR para conectar";
            iniciarPolling();
            break;
          case "DISCONNECTED":
            newMensajeSesion = "🔌 Desconectado. Inicia sesión.";
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;
          case "LOGGED_OUT":
            newMensajeSesion = "🔒 Sesión cerrada. Vuelve a iniciar.";
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;
          case "CONNECTING":
            newMensajeSesion = "⏳ Conectando...";
            iniciarPolling();
            break;
          case "ERROR":
            newMensajeSesion = "❌ Error en sesión. Reintentar.";
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;
          default:
            newMensajeSesion = `Estado: ${data.estado}. Esperando...`;
            iniciarPolling();
        }
        setMensajeSesion(newMensajeSesion);
      } else {
        setEstadoSesion("ERROR_SERVICIO");
        setMensajeSesion("⚠️ No se pudo obtener estado del servicio WhatsApp.");
        setQrCodeUrl(null);
        if (pollingRef.current) clearTimeout(pollingRef.current);
      }
    } catch (error) {
      console.error("❌ Error al verificar estado:", error);
      setEstadoSesion("ERROR_SERVICIO");
      setMensajeSesion("Error de comunicación con el servicio de WhatsApp.");
      setQrCodeUrl(null);
      if (pollingRef.current) clearTimeout(pollingRef.current);
    }
  };

  const handleIniciarSesion = async () => {
   
    setCargandoSesion(true);
    setQrCodeUrl(null);
    setMensajeSesion("🚀 Solicitando inicio de sesión...");
    try {
      await iniciarSesionWhatsApp();
      toast.success("Solicitud enviada. Verificando...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await verificarEstadoSesion();
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      toast.error("No se pudo iniciar la solicitud de sesión.");
      setEstadoSesion("ERROR");
      setMensajeSesion("❌ Error al intentar iniciar sesión.");
    } finally {
      setCargandoSesion(false);
    }
  };

  const handleLogout = async () => {
   
    const toastId = toast.loading("Cerrando sesión de WhatsApp...");
    try {
      await logoutWhatsApp();
      toast.success("Sesión cerrada. Necesitarás escanear QR.", {
        id: toastId,
      });
      await verificarEstadoSesion();
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar la sesión.", { id: toastId });
    }
  };

  const handleEnviar = async () => {
    /* ... Tu lógica existente para enviar mensajes ad-hoc no cambia ... */
    if (!mensaje.trim()) {
      toast.error("El mensaje no puede estar vacío.");
      return;
    }
    if (estadoSesion !== "CONNECTED") {
      toast.error("WhatsApp no está conectado.");
      return;
    }
    setEnviando(true);
    const toastId = toast.loading("Enviando mensaje...");
    try {
      if (modoEnvio === "individual") {
        if (!invitadoId || !telefono) {
          toast.error("Selecciona un invitado con teléfono.");
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }
        const telefonoNormalizado = normalizePhoneNumber(telefono);
        if (!telefonoNormalizado) {
          toast.error(`El número "${telefono}" del invitado no es válido.`);
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }
        await sendDirectMessage(telefonoNormalizado, mensaje);
        const nombreInvitado =
          invitados.find((i) => i._id === invitadoId)?.nombre || "invitado";
        toast.success(`📤 Mensaje enviado a ${nombreInvitado}.`);
        setInvitadoId("");
        setTelefono("");
      } else {
        if (!listaSeleccionadaId) {
          toast.error("Selecciona una lista de difusión.");
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }
        const listaActual = listasDifusion.find(
          (l) => l._id === listaSeleccionadaId
        );
        if (
          !listaActual ||
          !listaActual.invitados ||
          listaActual.invitados.length === 0
        ) {
          toast.error(
            `La lista "${listaActual?.nombre}" no tiene invitados o los invitados no tienen teléfono.`
          );
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }
        const telefonosCrudosDeLaLista = listaActual.invitados
          .map((inv) => inv.telefono)
          .filter(Boolean) as string[];
        if (telefonosCrudosDeLaLista.length === 0) {
          toast.error(
            `No se encontraron números de teléfono válidos en la lista "${listaActual.nombre}".`
          );
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }
        const telefonosNormalizadosDeLista = telefonosCrudosDeLaLista
          .map((tel) => normalizePhoneNumber(tel))
          .filter((tel) => tel);
        if (telefonosNormalizadosDeLista.length === 0) {
          toast.error("Ningún número en la lista es válido tras normalizar.");
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }
        await sendBroadcastMessage(telefonosNormalizadosDeLista, mensaje);
        toast.success(
          `📢 Mensaje enviado a ${telefonosNormalizadosDeLista.length} destinatarios de la lista "${listaActual.nombre}".`
        );
        setListaSeleccionadaId("");
      }
      setMensaje("");
    } catch (error: any) {
      console.error("❌ Error al enviar mensaje:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo enviar el mensaje.";
      toast.error(errorMessage);
    } finally {
      setEnviando(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          📨 Enviar Mensajes de WhatsApp
        </h2>
      </div>

      {/* Panel de Estado de Sesión (sin cambios significativos) */}
      <div className="border p-5 rounded-lg bg-gray-50 shadow space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">
          📲 Estado de la Sesión
        </h3>
        <p className="text-sm">
          <span className="font-medium">Estado:</span>{" "}
          <span
            className={`font-semibold ${
              estadoSesion === "CONNECTED"
                ? "text-green-600"
                : estadoSesion.startsWith("ERROR") ||
                  estadoSesion === "LOGGED_OUT"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {estadoSesion === "NEEDS_QR"
              ? "Esperando escaneo de QR"
              : mensajeSesion}
          </span>
        </p>
        {estadoSesion !== "CONNECTED" &&
          estadoSesion !== "NEEDS_QR" &&
          estadoSesion !== "CONNECTING" && (
            <button
              className={`px-5 py-2.5 rounded-md text-white font-medium transition-colors duration-150 text-sm ${
                cargandoSesion
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handleIniciarSesion}
              disabled={cargandoSesion || estadoSesion === "CONNECTING"}
            >
              {cargandoSesion
                ? "Conectando..."
                : estadoSesion === "LOGGED_OUT" ||
                  estadoSesion.startsWith("ERROR")
                ? "🔄 Reintentar"
                : "🔌 Iniciar Sesión"}
            </button>
          )}
        {estadoSesion === "CONNECTED" && (
          <button
            className="ml-3 px-5 py-2.5 rounded-md text-white font-medium bg-red-500 hover:bg-red-600 transition-colors duration-150 text-sm"
            onClick={handleLogout}
            disabled={cargandoSesion}
          >
            🚪 Cerrar Sesión
          </button>
        )}
      </div>

      {/* Formulario de Envío (solo si está conectado) */}
      {estadoSesion === "CONNECTED" ? (
        <>
          <div className="flex items-center gap-4 border-b pb-4 mb-6">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                modoEnvio === "individual"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setModoEnvio("individual")}
            >
              👤 Mensaje Individual
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                modoEnvio === "lista"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setModoEnvio("lista")}
            >
              📋 Mensaje a Lista
            </button>

            {/* ▼▼▼ NUEVO/MODIFICADO: Botón para abrir el modal de invitaciones ▼▼▼ */}
            <button
              onClick={() => setIsInvitationModalOpen(true)}
              className="ml-auto px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white shadow-sm hover:bg-purple-700 transition-colors"
            >
              💌 Enviar Invitaciones Iniciales
            </button>
          </div>
          {modoEnvio === "individual" ? (
            <div className="space-y-3">
              <label
                htmlFor="select-invitado"
                className="block font-medium text-gray-700 text-sm"
              >
                📱 Selecciona Invitado
              </label>
              <Select
                inputId="select-invitado"
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
                placeholder="Buscar y seleccionar invitado..."
                isSearchable
                className="text-sm"
                noOptionsMessage={() =>
                  invitados.length === 0 && !cargandoSesion
                    ? "Carga primero los datos de invitados."
                    : "No hay opciones"
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label
                htmlFor="select-lista"
                className="block font-medium text-gray-700 text-sm"
              >
                📝 Selecciona Lista de Difusión
              </label>
              <select
                id="select-lista"
                value={listaSeleccionadaId}
                onChange={(e) => setListaSeleccionadaId(e.target.value)}
                className="border rounded-md p-2.5 w-full text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
              >
                <option value="">-- Selecciona una lista --</option>
                {listasDifusion.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-6">
            <label className="block font-medium text-gray-700 text-sm mb-1">
              ✍️ Escribe tu Mensaje
            </label>
            <EditorMensaje mensaje={mensaje} onMensajeChange={setMensaje} />
          </div>

          <button
            className={`w-full mt-6 px-6 py-3 rounded-md text-white font-semibold text-base transition-colors duration-150 ${
              enviando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={handleEnviar}
            disabled={enviando || estadoSesion !== "CONNECTED"}
          >
            {enviando ? "Enviando..." : "🚀 Enviar Mensaje"}
          </button>

          {/* <MensajeProgramadoForm
            modoEnvio={modoEnvio}
            invitadoId={invitadoId}
            listaId={listaSeleccionadaId} 
          /> */}
        </>
      ) : (
        <p className="text-center text-gray-600 py-10 bg-gray-50 rounded-lg shadow mt-6">
          ℹ️ Debes iniciar y conectar tu sesión de WhatsApp para poder enviar
          mensajes.
        </p>
      )}

      {/* ▼▼▼ NUEVO/MODIFICADO: Renderizado del modal ▼▼▼ */}
      {isInvitationModalOpen && (
        <EnviarInvitacionModal
          isOpen={isInvitationModalOpen}
          onClose={() => setIsInvitationModalOpen(false)}
          bodaId={bodaId}
        />
      )}
    </div>
  );
}
