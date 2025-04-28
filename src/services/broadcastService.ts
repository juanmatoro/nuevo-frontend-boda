import axiosInstance from "./axiosInstance";
import { BroadcastList } from "@/interfaces/broadcast";
import axios from "@/services/axiosInstance";

export const getListasPorInvitado = async (
  invitadoId: string
): Promise<BroadcastList[]> => {
  const response = await axiosInstance.get<BroadcastList[]>(
    `/lists/por-invitado/${invitadoId}`
  );
  return response.data;
};

export const getBroadcastListsByBoda = async (
  bodaId: string
): Promise<BroadcastList[]> => {
  const response = await axiosInstance.get<BroadcastList[]>(
    `/lists?bodaId=${bodaId}`
  );
  return response.data;
};

export const crearListaDifusion = async (
  nombre: string,
  invitados: string[]
) => {
  const response = await axios.post("/lists", {
    nombre,
    invitados,
  });
  return response.data;
};
