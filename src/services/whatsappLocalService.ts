// src/services/whatsappLocalService.ts

import axios from "axios";
import axiosInstance from "./axiosInstance";

// const RAILWAY_APP_URL = "https://whatsapp.celebra-conmigo.com"; // <-- PEGA TU URL DE RAILWAY AQUÍ
// const RAILWAY_APP_URL = "http://localhost:4003"; // Cambia esto a tu URL de Railway o localhost
const NEXT_PUBLIC_API_BASE_URL = "http://localhost:3001/api";
const WHATSAPP_API_KEY = process.env.WHATSAPP_SERVICE_API_KEY;

const whatsappAPI = axios.create({
  baseURL: NEXT_PUBLIC_API_BASE_URL,
});

export const sendDirectMessage = async (telefono: string, mensaje: string) => {
  const response = await axiosInstance.post("/whatsapp-proxy/send", {
    telefono,
    mensaje,
  });
  return response.data;
};

export const sendBroadcastMessage = async (
  telefonos: string[],
  mensaje: string
) => {
  const response = await axiosInstance.post("/whatsapp-proxy/broadcast", {
    telefonos,
    mensaje,
  });
  return response.data;
};

export const obtenerEstadoSesion = async () => {
  const response = await axiosInstance.get("/whatsapp-proxy/status"); // Irá a RAILWAY_APP_URL/status
  return response.data;
};

export const iniciarSesionWhatsApp = async () => {
  const response = await axiosInstance.post("/whatsapp-proxy/start-session"); // Irá a RAILWAY_APP_URL/start-session
  return response.data;
};

export const logoutWhatsApp = async () => {
  const response = await axiosInstance.post("/whatsapp-proxy/logout");
  return response.data;
};
