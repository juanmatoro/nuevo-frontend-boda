import axiosInstance from "./axiosInstance";

// 📌 Filtra invitados que hayan respondido con una opción concreta a una pregunta
export const filtrarInvitadosPorRespuesta = async (
  preguntaId: string,
  respuesta: string
) => {
  const response = await axiosInstance.post(
    "/guests/actions/filtrar-por-respuesta",
    {
      preguntaId,
      respuesta,
    }
  );
  return response.data; // { total: number, invitados: Invitado[] }
};
