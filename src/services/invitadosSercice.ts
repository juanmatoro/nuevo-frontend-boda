import axios from "./axiosInstance";
import { Invitado } from "@/interfaces/invitado";
import apiClient from "@/services/apiClient";

// Obtener un invitado por ID (para novios/admin)
export const getInvitadoById = async (id: string): Promise<Invitado> => {
  try {
    const response = await apiClient.get(`/guests/${id}`);
    // ▼▼▼ CORRECCIÓN CLAVE: Devolvemos response.data.invitado ▼▼▼
    return response.data.invitado;
  } catch (error) {
    console.error(`Error al obtener el invitado ${id}:`, error);
    throw error;
  }
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
    "/guests//actions/filtrar-por-respuesta",
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

// // src/services/invitadosSercice.ts
// import apiClient from "./apiClient"; // O "./axiosInstance", asegúrate que sea tu instancia configurada
// import { Invitado } from "@/interfaces/invitado";
// import { Question } from "@/interfaces/preguntas";

// // NOTA: Todas las llamadas han sido actualizadas para usar 'apiClient'.
// // Esto asegura que el token JWT del usuario logueado se envíe automáticamente.

// // 📌 Obtener un invitado por ID (para novios/admin)
// export const getInvitadoById = async (id: string) => {
//   const response = await apiClient.get(`/guests/${id}`);
//   return response.data.invitado; // Asumiendo que el backend devuelve { ok: true, invitado: {...} }
// };

// // 📌 Actualizar un invitado (para novios/admin)
// export const updateInvitado = async (id: string, data: Partial<Invitado>) => {
//   const response = await apiClient.patch<Invitado>(`/guests/${id}`, data);
//   return response.data;
// };

// // 📌 Obtener todos los invitados de una boda (paginado)
// export const getInvitadosByBoda = async (
//   bodaId: string,
//   page: number = 1,
//   limit: number = 20
// ) => {
//   const response = await apiClient.get(
//     `/guests/boda/${bodaId}?page=${page}&limit=${limit}`
//   );
//   return response.data;
// };

// // 📌 Obtener TODOS los invitados de una boda sin paginación
// export const getAllGuestsByBoda = async (bodaId: string) => {
//   const response = await apiClient.get(`/guests/actions/all-by-boda/${bodaId}`);
//   return response.data;
// };

// // 📌 Crear nuevo invitado (para novios/admin)
// export const createInvitado = async (data: any) => {
//   const response = await apiClient.post("/guests", data);
//   return response.data;
// };

// // 📌 Eliminar invitado (para novios/admin)
// export const deleteInvitado = async (id: string) => {
//   const response = await apiClient.delete(`/guests/${id}`);
//   return response.data;
// };

// // 📌 Asignar pregunta a invitados (para novios/admin)
// export const asignarPreguntaAInvitados = async (data: {
//   preguntaId: string;
//   tipoAsignacion: "todos" | "lista" | "invitado";
//   listaId?: string;
//   invitadoId?: string;
// }) => {
//   const response = await apiClient.post(
//     "/guests/actions/asignar-pregunta",
//     data
//   );
//   return response.data;
// };

// // 📌 Obtener invitados pendientes de invitación (para el modal de invitaciones)
// export const getPendingGuestsByBoda = async (
//   bodaId: string
// ): Promise<Invitado[]> => {
//   if (!bodaId) return [];
//   try {
//     const params = new URLSearchParams({
//       messageSentInitialInvitation: "false",
//       status: "true",
//       limit: "1000",
//     });
//     const endpoint = `/guests/boda/${bodaId}?${params.toString()}`;
//     const response = await apiClient.get(endpoint);
//     return response.data.invitados || [];
//   } catch (error) {
//     console.error("Error al obtener los invitados pendientes:", error);
//     throw error;
//   }
// };

// // --- FUNCIONES PARA INVITADOS Y NOVIOS SOBRE RESPUESTAS ---

/**
 * Para que un NOVIO/ADMIN guarde o actualice las respuestas de un invitado específico.
 * Llama al endpoint que usa el ID del invitado en la URL.
 * @param invitadoId - El ID del invitado a modificar.
 * @param respuestas - El array de respuestas.
 */
export const guardarRespuestasPorAdmin = async (
  invitadoId: string,
  respuestas: any[]
): Promise<Invitado> => {
  // Llama a la ruta /api/guests/:id/answers
  const response = await apiClient.post<Invitado>(
    `/guests/${invitadoId}/answers`,
    {
      respuestas,
    }
  );
  return response.data;
};

/**
 * ▼▼▼ NUEVA FUNCIÓN PARA INVITADOS ▼▼▼
 * Para que un INVITADO guarde SUS PROPIAS respuestas.
 * Llama al endpoint /me/answers, que identifica al invitado por su token JWT.
 * No necesita el ID como parámetro.
 * @param respuestas - El array de respuestas que el invitado envía.
 */
export const guardarMisRespuestas = async (
  respuestas: {
    preguntaId: string;
    respuesta: string;
    subRespuesta?: string;
  }[]
): Promise<{ ok: boolean; message: string; invitado: Invitado }> => {
  // Llama a la nueva ruta /api/guests/me/answers
  const response = await apiClient.post(`/guests/me/answers`, {
    respuestas,
  });
  return response.data;
};

/**
 * Obtiene el perfil del propio invitado autenticado.
 * Llama al endpoint GET /api/guests/me/profile, que identifica al invitado
 * a través de su token JWT de sesión.
 * @returns Una promesa que se resuelve con los datos del invitado.
 */
export const getMyGuestProfile = async (): Promise<Invitado> => {
  try {
    // 1. Realiza la petición al endpoint seguro para invitados.
    // No se necesita pasar un ID porque el backend lo identifica por el token.
    const response = await apiClient.get("/guests/me/profile");

    // 2. El backend devuelve un objeto como { ok: true, invitado: {...} }.
    // Devolvemos solo el objeto del invitado.
    return response.data.invitado;
  } catch (error) {
    console.error("Error al obtener el perfil del invitado:", error);
    // Relanzamos el error para que el componente que llama (la página del panel)
    // pueda manejarlo y mostrar un mensaje al usuario.
    throw error;
  }
};
