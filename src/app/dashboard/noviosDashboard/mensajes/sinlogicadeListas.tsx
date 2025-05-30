// src/app/admin/mensajes/MensajesPage.tsx (o la ruta que tengas)
"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import EditorMensaje from "@/app/components/admin/EditorMensaje"; // Ajusta la ruta si es necesario
import MensajeProgramadoForm from "@/app/components/admin/MensajeProgramado"; // Ajusta la ruta
import { getAllGuestsByBoda } from "@/services/invitadosSercice"; // Tus servicios existentes
import { getBroadcastListsByBoda as getBroadcastListsService } from "@/services/broadcastService"; // Tus servicios
import {
  sendDirectMessage,
  sendBroadcastMessage,
  iniciarSesionWhatsApp,
  obtenerEstadoSesion,
  logoutWhatsApp,
} from "@/services/whatsappLocalService"; // Nuestro servicio de WhatsApp
import Select from "react-select";

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
  // Aquí podrían ir más campos, como un array de IDs de las listas a las que pertenece
}

interface ListaDifusion {
  _id: string;
  nombre: string;
  // Para que el broadcast funcione correctamente, esta interfaz (o los datos que cargas)
  // debería contener una forma de identificar a los invitados que pertenecen a ella,
  // por ejemplo, un array de `invitadoIds` o incluso los objetos `Invitado` completos.
  // Ejemplo:
  // invitadoIds?: string[];
  // invitados?: Pick<Invitado, '_id' | 'telefono'>[]; // Solo los campos necesarios
}

// --- FUNCIÓN DE NORMALIZACIÓN DE TELÉFONOS ---
/**
 * Normaliza un número de teléfono para asegurar que incluya el código de país.
 * Asume España (34) como país por defecto si el número parece local.
 * @param phoneNumber El número de teléfono tal como viene de la BBDD o input.
 * @param defaultCountryCode El código de país por defecto (ej: "34" para España).
 * @returns El número normalizado (solo dígitos, con código de país), o cadena vacía si no es válido.
 */
function normalizePhoneNumber(
  phoneNumber: string,
  defaultCountryCode: string = "34"
): string {
  if (!phoneNumber || typeof phoneNumber !== "string") return "";

  // 1. Limpiar espacios, guiones, paréntesis, etc. Dejar solo dígitos y el posible "+" inicial.
  let cleaned = phoneNumber.trim().replace(/[\s-()]/g, "");

  // 2. Si empieza con "+", quitarlo y procesar el resto.
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
    // Si después del "+" ya tiene el defaultCountryCode (ej: +34...), está bien.
    // Si tiene otro código de país (ej: +33...), también se asume correcto.
    // Validar que el resto sean solo dígitos.
    return /^\d+$/.test(cleaned) ? cleaned : "";
  }

  // 3. Si empieza con "00" seguido del código de país (ej: "0034...")
  if (cleaned.startsWith("00" + defaultCountryCode)) {
    // Quitar "00" y validar que el resto sean dígitos.
    const numberPart = cleaned.substring(2 + defaultCountryCode.length);
    return /^\d+$/.test(defaultCountryCode + numberPart)
      ? defaultCountryCode + numberPart
      : "";
  }

  // 4. Si ya empieza con el código de país (ej: "346...")
  if (cleaned.startsWith(defaultCountryCode)) {
    // Validar que el resto sean solo dígitos.
    return /^\d+$/.test(cleaned) ? cleaned : "";
  }

  // 5. Si es un número español local de 9 dígitos (móvil o algunos fijos)
  //    y no empezó con ninguna de las formas internacionales anteriores.
  if (
    defaultCountryCode === "34" &&
    cleaned.length === 9 &&
    /^[6789]\d{8}$/.test(cleaned)
  ) {
    return defaultCountryCode + cleaned; // Anteponer "34"
  }

  // 6. Si es un número de cualquier país pero ya tiene un código de país implícito (ej. francés 06... o inglés 07...)
  //    Esta parte es más compleja y requeriría reglas por país o una librería.
  //    Por ahora, si no cumple las reglas anteriores y no es claramente internacional,
  //    podríamos considerarlo no válido o devolverlo tal cual si esperamos que ya venga bien.
  //    Para este ejemplo, si no se pudo normalizar a un formato con `defaultCountryCode`,
  //    y no es ya un número que empiece por otro código de país (lo cual `cleaned.startsWith('+')` ya manejó),
  //    lo marcamos como potencialmente problemático devolviendo cadena vacía si no es puramente numérico.
  return /^\d+$/.test(cleaned) ? cleaned : ""; // Solo si es enteramente numérico
}
// --- FIN FUNCIÓN DE NORMALIZACIÓN ---

export default function MensajesPage() {
  const [mensaje, setMensaje] = useState("");
  const [modoEnvio, setModoEnvio] = useState<"individual" | "lista">(
    "individual"
  );
  const [invitadoId, setInvitadoId] = useState("");
  const [telefono, setTelefono] = useState(""); // Este es el teléfono "crudo" del invitado seleccionado
  const [listaSeleccionadaId, setListaSeleccionadaId] = useState("");
  const [listasDifusion, setListasDifusion] = useState<ListaDifusion[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
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
    console.log("Datos de usuario cargados:", user); // Para depuración

    if (!user?.bodaId) {
      toast.error(
        "ID de boda no encontrado. Asegúrate de haber iniciado sesión correctamente."
      );
      console.error("Error: bodaId es undefined. User:", user);
      return;
    }

    try {
      const [invitadosData, listasData] = await Promise.all([
        getAllGuestsByBoda(user.bodaId),
        getBroadcastListsService(user.bodaId),
      ]);
      setInvitados(invitadosData.invitados || []);
      setListasDifusion(listasData || []);
      console.log("Invitados cargados:", invitadosData.invitados);
      console.log("Listas cargadas:", listasData);
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
            newMensajeSesion = "📲 Escanea el QR para conectar con WhatsApp";
            iniciarPolling();
            break;
          case "DISCONNECTED":
            newMensajeSesion = "🔌 Desconectado. Inicia sesión para continuar.";
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;
          case "LOGGED_OUT":
            newMensajeSesion = "🔒 Sesión cerrada. Vuelve a iniciar sesión.";
            if (pollingRef.current) clearTimeout(pollingRef.current);
            break;
          case "CONNECTING":
            newMensajeSesion = "⏳ Conectando a WhatsApp...";
            iniciarPolling();
            break;
          case "ERROR":
            newMensajeSesion = "❌ Error en la sesión. Intenta reiniciar.";
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
        setMensajeSesion(
          "⚠️ No se pudo obtener el estado del servicio de WhatsApp."
        );
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
      toast.success("Solicitud de inicio de sesión enviada. Verificando...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await verificarEstadoSesion();
    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      toast.error("No se pudo iniciar la solicitud de sesión de WhatsApp.");
      setEstadoSesion("ERROR");
      setMensajeSesion("❌ Error al intentar iniciar la sesión.");
    } finally {
      setCargandoSesion(false);
    }
  };

  const handleLogout = async () => {
    const toastId = toast.loading("Cerrando sesión de WhatsApp...");
    try {
      await logoutWhatsApp();
      toast.success(
        "Sesión de WhatsApp cerrada. Necesitarás escanear QR de nuevo.",
        { id: toastId }
      );
      await verificarEstadoSesion();
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar la sesión de WhatsApp correctamente.", {
        id: toastId,
      });
    }
  };

  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return;
    }
    if (estadoSesion !== "CONNECTED") {
      toast.error("WhatsApp no está conectado. Por favor, inicia sesión.");
      return;
    }

    setEnviando(true);
    const toastId = toast.loading("Enviando mensaje...");

    try {
      if (modoEnvio === "individual") {
        if (!invitadoId || !telefono) {
          // 'telefono' es el número crudo del invitado seleccionado
          toast.error("Selecciona un invitado y asegúrate que tenga teléfono.");
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }
        const telefonoNormalizado = normalizePhoneNumber(telefono); // NORMALIZAR AQUÍ
        if (!telefonoNormalizado) {
          toast.error(
            `El número de teléfono "${telefono}" del invitado no es válido.`
          );
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }
        await sendDirectMessage(telefonoNormalizado, mensaje);
        toast.success(
          "📤 Mensaje enviado al invitado: " +
            invitados.find((i) => i._id === invitadoId)?.nombre
        );
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

        // --- TODO: IMPLEMENTAR LÓGICA PARA OBTENER TELÉFONOS DE LA LISTA ---
        // Esta es la parte CRÍTICA que debes adaptar a tu estructura de datos.
        // Cómo obtienes los números de teléfono de los invitados de `listaActual`?
        // Ejemplo: si `listaActual` tuviera una propiedad `invitadoIds: string[]`
        // const telefonosCrudosDeLaLista = invitados
        //    .filter(inv => listaActual.invitadoIds?.includes(inv._id))
        //    .map(inv => inv.telefono)
        //    .filter(Boolean); // Filtra nulos o undefined

        // ¡RECUERDA REEMPLAZAR ESTO CON TU LÓGICA REAL!
        console.warn(
          "Usando teléfonos DUMMY para la lista de difusión. Implementa la lógica real para obtenerlos de 'listaActual' y 'invitados'."
        );
        // Para probar, puedes tomar los primeros X invitados que tengan teléfono:
        const telefonosCrudosDeLaLista = invitados
          .filter((i) => i.telefono)
          .slice(0, 2)
          .map((i) => i.telefono);
        // O usa unos fijos para la prueba, asegurándote de que son números a los que puedes enviar:
        // const telefonosCrudosDeLaLista = ["TU_NUMERO_DE_PRUEBA_1_CON_PREFIJO_PAIS", "TU_NUMERO_DE_PRUEBA_2_CON_PREFIJO_PAIS"];

        if (telefonosCrudosDeLaLista.length === 0) {
          toast.error(
            "La lista seleccionada no tiene invitados con teléfono válidos."
          );
          setEnviando(false);
          toast.dismiss(toastId);
          return;
        }

        const telefonosNormalizadosDeLista = telefonosCrudosDeLaLista
          .map((tel) => normalizePhoneNumber(tel))
          .filter((tel) => tel); // Filtrar los que quedaron vacíos o inválidos tras normalizar

        if (telefonosNormalizadosDeLista.length === 0) {
          toast.error(
            "Ningún número de teléfono en la lista es válido después de normalizar."
          );
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
      <h2 className="text-3xl font-bold text-gray-800">
        📨 Enviar Mensajes de WhatsApp
      </h2>

      {mostrarBanner && estadoSesion !== "NEEDS_QR" && (
        <div
          className={`px-4 py-3 rounded shadow-md mb-4 ${
            estadoSesion.startsWith("ERROR")
              ? "bg-red-100 border border-red-400 text-red-700"
              : estadoSesion === "CONNECTED" // Este banner no debería mostrarse si está conectado y !mostrarBanner
              ? "bg-green-100 border border-green-400 text-green-700"
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
            Abre WhatsApp en tu teléfono &gt; Menú o Ajustes &gt; Dispositivos
            vinculados &gt; Vincular un dispositivo.
          </p>
        </div>
      )}

      <div className="border p-5 rounded-lg bg-gray-50 shadow space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">
          📲 Estado de la Sesión de WhatsApp
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
                ? "🔄 Reintentar Conexión"
                : "🔌 Iniciar Sesión"}
            </button>
          )}
        {estadoSesion === "CONNECTED" && (
          <button
            className="ml-3 px-5 py-2.5 rounded-md text-white font-medium bg-red-500 hover:bg-red-600 transition-colors duration-150 text-sm"
            onClick={handleLogout}
            disabled={cargandoSesion} // También deshabilitar si se está cargando una sesión
          >
            🚪 Cerrar Sesión WhatsApp
          </button>
        )}
      </div>

      {estadoSesion === "CONNECTED" ? (
        <>
          <div className="flex items-center gap-4 border-b pb-4 mb-4">
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
            <div className="space-y-2">
              <label className="block font-medium text-gray-700 text-sm">
                📱 Selecciona Invitado
              </label>
              <Select
                value={invitadosOptions.find(
                  (option) => option.value === invitadoId
                )}
                onChange={(selectedOption) => {
                  const id = selectedOption?.value;
                  setInvitadoId(id || "");
                  const invitado = invitados.find((i) => i._id === id);
                  setTelefono(invitado?.telefono || ""); // 'telefono' es el número crudo que se normalizará al enviar
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
            <div className="space-y-2">
              <label className="block font-medium text-gray-700 text-sm">
                📝 Selecciona Lista de Difusión
              </label>
              <select
                value={listaSeleccionadaId}
                onChange={(e) => setListaSeleccionadaId(e.target.value)}
                className="border rounded-md p-2 w-full text-sm focus:ring-indigo-500 focus:border-indigo-500"
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

          <div>
            <label className="block font-medium text-gray-700 text-sm mb-1">
              ✍️ Escribe tu Mensaje
            </label>
            <EditorMensaje mensaje={mensaje} onMensajeChange={setMensaje} />
          </div>

          <button
            className={`w-full px-6 py-3 rounded-md text-white font-semibold text-base ${
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
            // Pasar datos normalizados o crudos según lo que espere MensajeProgramadoForm
            // invitadoId={invitadoId} 
            // listaId={listaSeleccionadaId} 
          />
          */}
        </>
      ) : (
        <p className="text-center text-gray-600 py-10 bg-gray-50 rounded-lg shadow">
          ℹ️ Debes iniciar y conectar tu sesión de WhatsApp para poder enviar
          mensajes.
        </p>
      )}
    </div>
  );
}
