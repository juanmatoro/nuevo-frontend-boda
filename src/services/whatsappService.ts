// src/services/whatsappService.ts
import axios from "axios";

// Usa la URL del microservicio local
const whatsappAPI = axios.create({
  baseURL: "http://localhost:3002", // actualiza si es otro puerto
});

export const enviarMensaje = async (telefono: string, mensaje: string) => {
  return whatsappAPI.post("/send", { telefono, mensaje });
};

export const enviarMensajeBroadcast = async (
  nombreLista: string,
  mensaje: string
) => {
  return whatsappAPI.post("/broadcast", { nombreLista, mensaje });
};

export const obtenerEstadoSesion = async () => {
  return whatsappAPI.get("/status");
};
