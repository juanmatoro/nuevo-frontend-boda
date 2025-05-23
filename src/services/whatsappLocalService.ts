// src/services/whatsappLocalService.ts o .js

import axios from "axios";

const whatsappAPI = axios.create({
  baseURL: "http://localhost:4003", // Asegúrate que esta URL es correcta
});

export const sendDirectMessage = async (telefono: string, mensaje: string) => {
  const response = await whatsappAPI.post("/send", { telefono, mensaje });
  return response.data;
};

export const sendBroadcastMessage = async (
  telefonos: string[], // Cambiado de nombreLista a telefonos (array de strings)
  mensaje: string
) => {
  const response = await whatsappAPI.post("/broadcast", {
    telefonos, // Enviar el array de teléfonos
    mensaje,
  });
  return response.data;
};

export const obtenerEstadoSesion = async () => {
  const response = await whatsappAPI.get("/status");
  return response.data;
};

export const iniciarSesionWhatsApp = async () => {
  const response = await whatsappAPI.post("/start-session");
  return response.data;
};

export const logoutWhatsApp = async () => {
  const response = await whatsappAPI.post("/logout");
  return response.data;
};
