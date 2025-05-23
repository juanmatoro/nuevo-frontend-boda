"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
// ... tus otros imports
import {
  sendDirectMessage,
  sendBroadcastMessage,
  iniciarSesionWhatsApp, // Esta llama a POST /start-session
  obtenerEstadoSesion, // Esta llama a GET /status
} from "@/services/whatsappLocalService"; // Asegúrate que la baseURL es http://localhost:4000
import Select from "react-select";

// ... tus interfaces

export default function MensajesPage() {
  // ... otros estados
  const [estadoSesion, setEstadoSesion] = useState<string>("CONECTANDO");
  const [mensajeSesion, setMensajeSesion] = useState<string>(
    "Verificando sesión..."
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null); // Estado para la URL del QR
  const [mostrarBanner, setMostrarBanner] = useState(false); // Para el banner de estado general

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    cargarDatos();
    verificarEstadoSesion(); // Llama al iniciar para conocer el estado actual

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  // ... cargarDatos y useEffect para invitadosOptions sin cambios

  const iniciarPolling = () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current); // Limpia el anterior por si acaso
    }
    pollingRef.current = setTimeout(() => {
      verificarEstadoSesion();
      // No reseteamos pollingRef.current a null aquí para evitar múltiples polls si verificarEstadoSesion es muy rápido
    }, 5000); // Polling cada 5 segundos
  };

  const verificarEstadoSesion = async () => {
    try {
      const data = await obtenerEstadoSesion(); // Esto es GET /status

      if (data?.estado) {
        setEstadoSesion(data.estado);
        setQrCodeUrl(data.qr || null); // Actualiza el QR, será null si no viene en la respuesta

        switch (data.estado) {
          case "CONNECTED":
            setMensajeSesion("✅ Conectado a WhatsApp");
            setMostrarBanner(false); // Oculta el banner amarillo si todo está OK
            if (pollingRef.current) clearTimeout(pollingRef.current); // Detener polling si está conectado
            break;

          case "NEEDS_QR":
            setMensajeSesion("📲 Escanea el QR para conectar con WhatsApp");
            setMostrarBanner(true); // Muestra el banner amarillo
            // data.qr ya está asignado a qrCodeUrl arriba
            // Continuar polling para que se actualice cuando el usuario escanee
            iniciarPolling();
            break;

          case "DISCONNECTED":
          case "LOGGED_OUT": // Nuevo estado del backend
            setMensajeSesion("🔌 Desconectado. Inicia sesión para continuar.");
            setMostrarBanner(true);
            // No iniciar polling si está explícitamente desconectado o logged out, esperar acción del usuario
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;

          case "CONNECTING":
            setMensajeSesion("⏳ Conectando a WhatsApp...");
            setMostrarBanner(true);
            iniciarPolling();
            break;

          case "ERROR":
            setMensajeSesion(
              "❌ Error en la sesión de WhatsApp. Intenta reiniciar."
            );
            setMostrarBanner(true);
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;

          default: // Otros estados intermedios o desconocidos
            setMensajeSesion(`Estado: ${data.estado}. Esperando...`);
            setMostrarBanner(true);
            iniciarPolling();
        }
      }
    } catch (error) {
      console.error("❌ Error al verificar estado:", error);
      setEstadoSesion("ERROR");
      setMensajeSesion(
        "Error al obtener estado de la sesión. Verifica el servicio de WhatsApp."
      );
      setQrCodeUrl(null);
      setMostrarBanner(true);
      if (pollingRef.current) clearTimeout(pollingRef.current); // Detener en caso de error de comunicación
    }
  };

  const handleIniciarSesion = async () => {
    setCargandoSesion(true);
    setQrCodeUrl(null); // Limpia cualquier QR antiguo
    setMensajeSesion("🚀 Solicitando inicio de sesión...");
    setMostrarBanner(true);
    try {
      // Esta llamada (POST /start-session) es la que le dice al backend
      // que inicie una conexión. Si necesita un QR, el backend lo preparará.
      await iniciarSesionWhatsApp();
      toast.success("Solicitud de inicio de sesión enviada. Verificando...");
      // Inmediatamente después de solicitar, verificamos el estado.
      // El backend habrá tenido un momento para generar el QR si es necesario.
      await verificarEstadoSesion(); // Esto llamará a GET /status y obtendrá el QR si está listo
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      toast.error("No se pudo iniciar la sesión de WhatsApp.");
      setEstadoSesion("ERROR");
      setMensajeSesion("❌ Error al intentar iniciar sesión.");
    } finally {
      setCargandoSesion(false);
    }
  };

  // ... handleEnviar sin cambios relevantes para el QR

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">📨 Enviar Mensajes</h2>

      {/* Banner de estado general */}
      {mostrarBanner && estadoSesion !== "NEEDS_QR" && (
        <div
          className={`px-4 py-3 rounded shadow-md mb-4 ${
            estadoSesion === "ERROR"
              ? "bg-red-100 border border-red-400 text-red-700"
              : estadoSesion === "CONNECTED"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-yellow-100 border border-yellow-400 text-yellow-700"
          }`}
        >
          {mensajeSesion}
        </div>
      )}

      {/* Sección específica para mostrar el QR */}
      {estadoSesion === "NEEDS_QR" && qrCodeUrl && (
        <div className="my-4 p-6 border bg-white rounded-lg shadow-lg flex flex-col items-center text-center">
          <p className="mb-3 text-lg font-semibold text-gray-700">
            {mensajeSesion} {/* "Escanea el QR para conectar..." */}
          </p>
          <img
            src={qrCodeUrl}
            alt="Escanea este código QR con WhatsApp"
            className="w-64 h-64 md:w-72 md:h-72 border shadow-md" // Ajusta tamaño si es necesario
          />
          <p className="mt-3 text-sm text-gray-500">
            Abre WhatsApp en tu teléfono &gt; Ajustes &gt; Dispositivos
            vinculados &gt; Vincular un dispositivo.
          </p>
        </div>
      )}

      <div className="border p-4 rounded bg-gray-50 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">
          📲 Sesión de WhatsApp
        </h3>
        <p className="text-sm">
          <span className="font-medium">Estado actual:</span>{" "}
          <span
            className={`font-semibold ${
              estadoSesion === "CONNECTED"
                ? "text-green-600"
                : estadoSesion === "ERROR" || estadoSesion === "LOGGED_OUT"
                ? "text-red-600"
                : "text-yellow-600" // Para NEEDS_QR, CONNECTING, DISCONNECTED
            }`}
          >
            {/* Usar un mensaje más general aquí si el QR se muestra arriba */}
            {estadoSesion === "NEEDS_QR"
              ? "Esperando escaneo de QR"
              : mensajeSesion}
          </span>
        </p>
        {estadoSesion !== "CONNECTED" &&
          estadoSesion !== "NEEDS_QR" &&
          estadoSesion !== "CONNECTING" && (
            <button
              className={`px-4 py-2 rounded text-white font-medium transition-colors duration-150 ${
                cargandoSesion
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handleIniciarSesion}
              disabled={cargandoSesion || estadoSesion === "CONNECTING"}
            >
              {cargandoSesion
                ? "Conectando..."
                : "🔄 Iniciar/Reintentar Sesión"}
            </button>
          )}
        {/* Botón de Logout (Opcional) */}
        {estadoSesion === "CONNECTED" && (
          <button
            className="ml-3 px-4 py-2 rounded text-white font-medium bg-red-500 hover:bg-red-600 transition-colors duration-150"
            onClick={async () => {
              // Aquí podrías llamar a un endpoint /logout en tu backend
              // que llame a sock.logout() y limpie la sesión.
              // Por ahora, solo como ejemplo conceptual de UI:
              toast("Funcionalidad de logout no implementada en este botón.");
              // Para implementarlo:
              // 1. Crea endpoint POST /logout en backend (ya lo hicimos).
              // 2. Crea función en whatsappLocalService.js:
              //    export const logoutWhatsApp = async () => whatsappAPI.post("/logout");
              // 3. Llama aquí: await logoutWhatsApp(); await verificarEstadoSesion();
            }}
          >
            🚪 Cerrar Sesión WhatsApp
          </button>
        )}
      </div>

      {/* El resto de tu UI para seleccionar modo de envío, invitado, lista, mensaje... */}
      {/* ... (Asegúrate de que solo se muestre si estadoSesion === "CONNECTED") ... */}
      {estadoSesion === "CONNECTED" ? (
        <>
          <div className="flex gap-4">{/* ... botones de modoEnvio ... */}</div>
          {/* ... selectores de invitado/lista y editor de mensaje ... */}
          {/* ... botón de Enviar Mensaje ... */}
        </>
      ) : (
        <p className="text-center text-gray-600 py-8">
          Debes iniciar sesión en WhatsApp para poder enviar mensajes.
        </p>
      )}
    </div>
  );
}
