import axios from "axios";

const whatsappAPI = axios.create({
  baseURL: "http://localhost:4000", // actualiza si es necesario
});

export const sendDirectMessage = async (telefono: string, mensaje: string) => {
  const response = await whatsappAPI.post("/send", { telefono, mensaje });
  return response.data;
};

export const sendBroadcastMessage = async (
  nombreLista: string,
  mensaje: string
) => {
  const response = await whatsappAPI.post("/broadcast", {
    nombreLista,
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
