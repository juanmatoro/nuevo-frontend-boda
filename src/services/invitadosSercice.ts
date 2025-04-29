import axios from "./axiosInstance";
import { Invitado } from "@/interfaces/invitado";

// 📌 Obtener un invitado por ID
export const getInvitadoById = async (id: string) => {
  const response = await axios.get(`/guests/${id}`);
  return response.data;
};

// 📌 Actualizar un invitado
export const updateInvitado = async (id: string, data: Partial<Invitado>) => {
  const response = await axios.patch<Invitado>(`/guests/${id}`, data);
  return response.data;
};

// 📌 Obtener todos los invitados de una boda (con paginación opcional)
export const getInvitadosByBoda = async (
  bodaId: string,
  page: number = 1,
  limit: number = 10
) => {
  const response = await axios.get(
    `/guests/invitados/${bodaId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getAllGuestsByBoda = async (bodaId: string) => {
  const response = await axios.get(`/guests/all-by-boda/${bodaId}`);
  return response.data;
};

// 📌 Crear nuevo invitado
export const createInvitado = async (data: any) => {
  const response = await axios.post("/guests", data);
  return response.data;
};

// 📌 Eliminar invitado
export const deleteInvitado = async (id: string) => {
  const response = await axios.delete(`/guests/${id}`);
  return response.data;
};
// 📌 Asignar pregunta a invitados (por tipo de asignación)
export const asignarPreguntaAInvitados = async ({
  preguntaId,
  tipoAsignacion,
  listaId,
  invitadoId,
}: {
  preguntaId: string;
  tipoAsignacion: "todos" | "lista" | "invitado";
  listaId?: string;
  invitadoId?: string;
}) => {
  const response = await axios.post("/guests/asignar-pregunta", {
    preguntaId,
    tipoAsignacion,
    listaId,
    invitadoId,
  });
  return response.data;
};

// 📌 Guardar respuestas desde el panel de invitado
export const guardarRespuestasInvitado = async (
  id: string,
  respuestas: any[]
): Promise<Invitado> => {
  const response = await axios.post<Invitado>(`/guests/${id}/responder`, {
    respuestas,
  });
  return response.data;
};

// 📌 Filtrar invitados por respuesta a una pregunta
// Esta función permite filtrar a los invitados según su respuesta a una pregunta específica
// y devuelve una lista de invitados que coinciden con esa respuesta.
export const filtrarInvitadosPorRespuesta = async (
  preguntaId: string,
  respuesta: string
): Promise<Invitado[]> => {
  const response = await axios.post<{ invitados: Invitado[] }>(
    "/guests/filtrar-por-respuesta",
    {
      preguntaId,
      respuesta,
    }
  );
  return response.data.invitados;
};

// 📌 Enviar respuestas del invitado
export const updateRespuestasInvitado = async (
  invitadoId: string,
  respuestas: {
    preguntaId: string;
    respuesta: string;
    subRespuesta?: string | null;
  }[]
) => {
  const response = await axios.patch(`/guests/${invitadoId}`, {
    respuestas,
  });
  return response.data;
};

// 📌 Obtener estadísticas de respuestas por pregunta
