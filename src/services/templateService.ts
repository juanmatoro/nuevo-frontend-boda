import apiClient from "./apiClient";
import { MessageTemplate } from "@/interfaces/template";

export const obtenerPlantillasPorBoda = async (
  bodaId: string
): Promise<MessageTemplate[]> => {
  if (!bodaId) return [];
  try {
    const response = await apiClient.get("/plantillas", { params: { bodaId } });
    return response.data.plantillas || [];
  } catch (error) {
    console.error("Error al obtener las plantillas:", error);
    throw error;
  }
};

export const crearPlantilla = async (
  templateData: Partial<MessageTemplate>
): Promise<MessageTemplate> => {
  try {
    const response = await apiClient.post("/plantillas", templateData);
    return response.data.plantilla;
  } catch (error) {
    console.error("Error al crear la plantilla:", error);
    throw error;
  }
};

export const editarPlantilla = async (
  id: string,
  templateData: Partial<MessageTemplate>
): Promise<MessageTemplate> => {
  try {
    const response = await apiClient.put(`/plantillas/${id}`, templateData);
    return response.data.plantilla;
  } catch (error) {
    console.error(`Error al actualizar la plantilla ${id}:`, error);
    throw error;
  }
};

export const eliminarPlantilla = async (id: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/plantillas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la plantilla ${id}:`, error);
    throw error;
  }
};
