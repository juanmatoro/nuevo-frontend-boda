import axios from "./axiosInstance";
import { Invitado } from "@/interfaces/invitado";
import apiClient from "./apiClient";

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
  limit: number = 20
) => {
  const response = await axios.get(
    `/guests/boda/${bodaId}?page=${page}&limit=${limit}`
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
/**
 * Obtiene solo los invitados de una boda que aún no han recibido la invitación inicial.
 * Llama al endpoint de 'obtenerInvitados' pero con filtros específicos.
 * @param bodaId - El ID de la boda para la cual se quieren obtener los invitados pendientes.
 * @returns Una promesa que se resuelve en un array de Invitado.
 */
export const getPendingGuestsByBoda = async (
  bodaId: string
): Promise<Invitado[]> => {
  if (!bodaId) {
    console.warn("getPendingGuestsByBoda: Se requiere un bodaId.");
    return [];
  }

  try {
    // Construimos los parámetros de la consulta (query params)
    const params = new URLSearchParams({
      messageSentInitialInvitation: "false", // Filtra por los que NO han recibido invitación
      status: "true", // Asegura que solo sean invitados activos
      limit: "1000", // Pide un límite alto para traerlos a todos de una vez
    });

    // Tu ruta actual para obtener invitados es /invitados/:bodaId según tu router
    // o /boda/:bodaId si la cambiaste. Ajusta si es necesario.
    const endpoint = `/guests/boda/${bodaId}?${params.toString()}`;

    const response = await apiClient.get(endpoint);

    // El token JWT del novio se añade automáticamente por el interceptor de apiClient
    // El backend devuelve { ok: true, invitados: [...] }
    return response.data.invitados || [];
  } catch (error) {
    console.error("Error al obtener los invitados pendientes:", error);
    throw error; // Relanza el error para que el componente que llama lo pueda manejar
  }
};
// 📌 Obtener estadísticas de respuestas por pregunta
