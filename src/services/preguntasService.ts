import axios from "axios";
import axiosInstance from "./axiosInstance";
import {
  Question,
  CrearPreguntaPayload,
  EditarPreguntaPayload,
} from "@/interfaces/preguntas";

// 📌 Crear una nueva pregunta
export const crearPregunta = async (
  data: CrearPreguntaPayload
): Promise<Question> => {
  const response = await axiosInstance.post<Question>("/preguntas", data);
  return response.data;
};

// 📌 Obtener todas las preguntas de una boda
export const obtenerPreguntasPorBoda = async (
  bodaId: string
): Promise<Question[]> => {
  const response = await axiosInstance.get<Question[]>(
    `/preguntas/boda/${bodaId}`
  );
  return response.data as Question[];
};

// 📌 Eliminar una pregunta por su ID
export const eliminarPregunta = async (
  preguntaId: string
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(
    `/preguntas/${preguntaId}`
  );
  return response.data;
};

// 📌 Editar una pregunta por su ID
export const editarPregunta = async (
  id: string,
  data: EditarPreguntaPayload
): Promise<Question> => {
  const response = await axiosInstance.put<Question>(`/preguntas/${id}`, data);
  return response.data;
};

// 📌 Crear automáticamente la pregunta de confirmación de asistencia
export const crearPreguntaConfirmacion = async (
  bodaId: string
): Promise<Question> => {
  const payload: CrearPreguntaPayload = {
    bodaId,
    pregunta: "¿Vas a asistir a la boda?",
    opciones: ["Sí", "No"],
    esObligatoria: true,
    esConfirmacionAsistencia: true,
  };

  const response = await axiosInstance.post<Question>("/preguntas", payload);
  return response.data;
};

export const getPlantillas = async (): Promise<string[]> => {
  const res = await axios.get<{ plantillas: string[] }>("/plantillas");
  return res.data.plantillas;
};

export const crearPlantilla = async (contenido: string) => {
  return await axios.post("/plantillas", { contenido });
};

// --- Acción de Asignar Pregunta ---
// Esta función ahora está aquí para centralizar la lógica de preguntas.
// Llama al endpoint correcto en el backend que está en el controlador de invitados.

interface AsignarPreguntaPayload {
  preguntaId: string;
  tipoAsignacion: "todos" | "lista" | "invitado";
  listaId?: string;
  invitadoId?: string;
}

export const asignarPreguntaAInvitados = async (
  payload: AsignarPreguntaPayload
) => {
  try {
    // ▼▼▼ CORRECCIÓN PRINCIPAL ▼▼▼
    // La ruta correcta en el backend es /guests/actions/asignar-pregunta
    const response = await axiosInstance.post(
      "/guests/asignar-pregunta",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error en el servicio al asignar pregunta:", error);
    throw error;
  }
};
