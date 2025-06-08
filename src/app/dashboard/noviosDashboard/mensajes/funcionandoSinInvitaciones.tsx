// src/app/admin/mensajes/MensajesPage.tsx (o la ruta que tengas)
"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import EditorMensaje from "@/app/components/admin/EditorMensaje";
import MensajeProgramadoForm from "@/app/components/admin/MensajeProgramado";
import {
  getAllGuestsByBoda,
  getInvitadosByBoda,
} from "@/services/invitadosSercice";
import { getBroadcastListsByBoda as getBroadcastListsService } from "@/services/broadcastService";
import {
  sendDirectMessage,
  sendBroadcastMessage,
  iniciarSesionWhatsApp,
  obtenerEstadoSesion,
  logoutWhatsApp,
} from "@/services/whatsappLocalService";
import Select from "react-select";

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
}

interface ListaDifusion {
  _id: string;
  nombre: string;
  invitados: Invitado[]; // Asumimos que el servicio carga los invitados (con teléfono) aquí
}

// // --- FUNCIÓN DE NORMALIZACIÓN DE TELÉFONOS ---
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
// // --- FIN FUNCIÓN DE NORMALIZACIÓN ---

export default function MensajesPage() {
  const [mensaje, setMensaje] = useState("");
  const [modoEnvio, setModoEnvio] = useState<"individual" | "lista">(
    "individual"
  );
  const [invitadoId, setInvitadoId] = useState("");
  const [telefono, setTelefono] = useState("");
  const [listaSeleccionadaId, setListaSeleccionadaId] = useState("");
  const [listasDifusion, setListasDifusion] = useState<ListaDifusion[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]); // Todos los invitados para el selector individual
  const [invitadosOptions, setInvitadosOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [estadoSesion, setEstadoSesion] = useState<string>("CONECTANDO");
  const [mensajeSesion, setMensajeSesion] = useState<string>(
    "Verificando sesión..."
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);

  useEffect(() => {
    cargarDatosIniciales();
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

  const cargarDatosIniciales = async () => {
    const userString = localStorage.getItem("user");
    const user = JSON.parse(userString || "{}");
    if (!user?.bodaId) {
      toast.error(
        "ID de boda no encontrado. Asegúrate de haber iniciado sesión correctamente."
      );
      return;
    }
    try {
      // Obtener todos los invitados (para el selector individual)
      const invitadosData = await getAllGuestsByBoda(user.bodaId);
      setInvitados(invitadosData.invitados || []);

      // Obtener las listas de difusión (que ya incluyen sus invitados)
      const listasData = await getBroadcastListsService(user.bodaId);
      setListasDifusion(listasData || []);
      console.log(
        "Listas de difusión cargadas (esperando que incluyan invitados):",
        listasData
      );
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
    try {
      const data = await obtenerEstadoSesion();
      if (data?.estado) {
        setEstadoSesion(data.estado);
        setQrCodeUrl(data.qr || null);
        let newBanner = true;
        let newMensajeSesion = "";
        switch (data.estado) {
          case "CONNECTED":
            newMensajeSesion = "✅ Conectado a WhatsApp";
            newBanner = false;
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
        setMostrarBanner(newBanner);
      } else {
        setEstadoSesion("ERROR_SERVICIO");
        setMensajeSesion("⚠️ No se pudo obtener estado del servicio WhatsApp.");
        setQrCodeUrl(null);
        setMostrarBanner(true);
        if (pollingRef.current) clearTimeout(pollingRef.current);
      }
    } catch (error) {
      console.error("❌ Error al verificar estado:", error);
      setEstadoSesion("ERROR_SERVICIO");
      setMensajeSesion("Error de comunicación con el servicio de WhatsApp.");
      setQrCodeUrl(null);
      setMostrarBanner(true);
      if (pollingRef.current) clearTimeout(pollingRef.current);
    }
  };

  const handleIniciarSesion = async () => {
    setCargandoSesion(true);
    setQrCodeUrl(null);
    setMensajeSesion("🚀 Solicitando inicio de sesión...");
    setMostrarBanner(true);
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
        // modoEnvio === "lista"
        if (!listaSeleccionadaId) {
          toast.error("Selecciona una lista de difusión.");
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }

        const listaActual = listasDifusion.find(
          (l) => l._id === listaSeleccionadaId
        );
        if (!listaActual) {
          toast.error("Lista de difusión no encontrada.");
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }

        let telefonosCrudosDeLaLista: string[] = [];
        if (listaActual.invitados && listaActual.invitados.length > 0) {
          telefonosCrudosDeLaLista = listaActual.invitados
            .map((invitado) => invitado.telefono) // Acceder directamente a la propiedad telefono
            .filter(Boolean) as string[]; // Filtrar nulos, undefined o strings vacíos
        } else {
          toast.error(
            `La lista "${listaActual.nombre}" no tiene invitados o los invitados no tienen teléfono.`
          );
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }

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

  // --- El JSX del return no ha cambiado respecto a la última versión completa que te pasé ---
  // --- Así que lo omito aquí para brevedad, pero usa el que ya tenías ---
  // Asegúrate de que los IDs de los elementos (si usas alguno para `toast.dismiss(toastId)`) sean correctos.
  // El toastId que se usa con toast.loading y toast.dismiss es el que devuelve toast.loading(), no un ID de elemento HTML.

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800">
        📨 Enviar Mensajes de WhatsApp
      </h2>

      {/* Banner y Sección de QR (sin cambios significativos) */}
      {mostrarBanner && estadoSesion !== "NEEDS_QR" && (
        <div
          className={`px-4 py-3 rounded shadow-md mb-4 ${
            estadoSesion.startsWith("ERROR")
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-yellow-100 border border-yellow-400 text-yellow-700"
          }`}
        >
          {mensajeSesion}
        </div>
      )}
      {estadoSesion === "NEEDS_QR" && qrCodeUrl && (
        <div className="my-4 p-6 border bg-white rounded-lg shadow-lg flex flex-col items-center text-center">
          <p className="mb-3 text-lg font-semibold text-gray-700">
            {mensajeSesion}
          </p>
          <img
            src={qrCodeUrl}
            alt="Escanea QR con WhatsApp"
            className="w-60 h-60 md:w-64 md:h-64 border shadow-md"
          />
          <p className="mt-3 text-sm text-gray-500">
            Abre WhatsApp &gt; Menú o Ajustes &gt; Dispositivos vinculados &gt;
            Vincular dispositivo.
          </p>
        </div>
      )}

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
              👤 Invitado Individual
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                modoEnvio === "lista"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setModoEnvio("lista")}
            >
              📋 Lista de Difusión
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
    </div>
  );
}
