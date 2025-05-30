// src/services/whatsappLocalService.ts

import axios from "axios";

const RAILWAY_APP_URL = "https://whatsapp.celebra-conmigo.com"; // <-- PEGA TU URL DE RAILWAY AQUÍ

const whatsappAPI = axios.create({
  baseURL: RAILWAY_APP_URL, // Asegúrate de que sea la URL base completa
});

export const sendDirectMessage = async (telefono: string, mensaje: string) => {
  const response = await whatsappAPI.post("/send", { telefono, mensaje });
  return response.data;
};

export const sendBroadcastMessage = async (
  telefonos: string[],
  mensaje: string
) => {
  const response = await whatsappAPI.post("/broadcast", {
    telefonos,
    mensaje,
  });
  return response.data;
};

export const obtenerEstadoSesion = async () => {
  const response = await whatsappAPI.get("/status"); // Irá a RAILWAY_APP_URL/status
  return response.data;
};

export const iniciarSesionWhatsApp = async () => {
  const response = await whatsappAPI.post("/start-session"); // Irá a RAILWAY_APP_URL/start-session
  return response.data;
};

export const logoutWhatsApp = async () => {
  const response = await whatsappAPI.post("/logout");
  return response.data;
};
