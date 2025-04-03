import axios from "./axiosInstance";

// ✅ Validar si un string es un ObjectId válido (24 caracteres hex)
const esObjectIdValido = (id: string) => /^[a-f\d]{24}$/i.test(id);

// 🔐 Obtener bodaId desde localStorage con validación
const getBodaId = (): string => {
  try {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const bodaId = user?.bodaId;

    if (!bodaId || !esObjectIdValido(bodaId)) {
      throw new Error("El bodaId es inválido o no existe.");
    }

    return bodaId;
  } catch (error) {
    console.error("❌ Error al obtener el bodaId:", error);
    throw error;
  }
};

// 📩 Enviar mensaje directo
export const sendDirectMessage = async (
  telefono: string,
  mensaje: string
): Promise<any> => {
  try {
    const bodaId = getBodaId();
    const response = await axios.post("/whatsapp/send", {
      telefono,
      mensaje,
      bodaId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error al enviar mensaje directo:", error);
    throw error;
  }
};

// 📢 Enviar mensaje a lista de difusión (usa listaId)
export const sendBroadcastMessage = async (
  listaId: string,
  mensaje: string
): Promise<any> => {
  try {
    const bodaId = getBodaId();
    const response = await axios.post("/whatsapp/broadcast", {
      listaId,
      mensaje,
      bodaId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error al enviar mensaje a lista:", error);
    throw error;
  }
};

// 🕓 Programar mensaje a múltiples invitados
export const scheduleMessage = async (
  invitados: string[], // array de _id de invitados
  mensaje: string,
  fechaEnvio: string // formato ISO o legible por backend
): Promise<any> => {
  try {
    const bodaId = getBodaId();
    const response = await axios.post("/whatsapp/schedule", {
      invitados,
      mensaje,
      fechaEnvio,
      bodaId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error al programar mensaje:", error);
    throw error;
  }
};
