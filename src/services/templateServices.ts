import apiClient from "./apiClient"; // O "./axiosInstance" si lo llamaste así
import { MessageTemplate } from "@/interfaces/template"; // Importa la interfaz

/**
 * Obtiene todas las plantillas de mensajes asociadas a una boda específica.
 * Llama al endpoint del backend que creamos para esta tarea.
 *
 * @param bodaId - El ID de la boda de la cual se quieren obtener las plantillas.
 * @returns Una promesa que se resuelve en un array de MessageTemplate.
 */
export const getMessageTemplatesByBoda = async (
  bodaId: string
): Promise<MessageTemplate[]> => {
  // Verificación para evitar llamadas a la API innecesarias si no hay bodaId
  if (!bodaId) {
    console.warn(
      "Se intentó llamar a getMessageTemplatesByBoda sin un ID de boda."
    );
    return []; // Devuelve un array vacío para evitar errores en el componente que lo llama
  }

  try {
    // Hace la petición GET al endpoint: /api/message-templates
    // Añade el bodaId como un query parameter en la URL.
    // El token JWT del "novio" se añadirá automáticamente a las cabeceras gracias al interceptor en apiClient.
    const response = await apiClient.get(`/message-templates?bodaId=${bodaId}`);

    // Basado en nuestro controlador `obtenerPlantillas`, la respuesta del backend tiene la forma:
    // { ok: true, plantillas: [...] }
    // Devolvemos solo el array de plantillas, o un array vacío si no viene nada.
    return response.data.plantillas || [];
  } catch (error) {
    console.error("Error al obtener las plantillas de mensajes:", error);
    // Relanzamos el error para que el componente que llama (ej. el modal) pueda manejarlo
    // y mostrar un mensaje de error al usuario si es necesario.
    throw error;
  }
};

// Aquí podrías añadir el resto de funciones CRUD para plantillas en el futuro,
// manteniendo toda la lógica relacionada en un solo lugar.
/*
export const createMessageTemplate = async (templateData: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    const response = await apiClient.post('/message-templates', templateData);
    return response.data.plantilla;
}
*/
