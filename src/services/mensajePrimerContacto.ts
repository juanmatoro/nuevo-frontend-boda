import axios from "@/services/axiosInstance";

export async function enviarPrimerContacto(bodaId: string, templateId: string) {
  return axios.post(`/whatsapp/primer-contacto`, { bodaId, templateId });
}
