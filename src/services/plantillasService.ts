import axiosInstance from "./axiosInstance";

export const obtenerPlantillas = async () => {
  const response = await axiosInstance.get("/plantillas");
  return response.data;
};

export const crearPlantilla = async (nombre: string, contenido: string) => {
  const response = await axiosInstance.post("/plantillas", {
    nombre,
    contenido,
  });
  return response.data;
};

export const editarPlantilla = async (
  id: string,
  nombre: string,
  contenido: string
) => {
  const response = await axiosInstance.put(`/plantillas/${id}`, {
    nombre,
    contenido,
  });
  return response.data;
};

export const eliminarPlantilla = async (id: string) => {
  const response = await axiosInstance.delete(`/plantillas/${id}`);
  return response.data;
};
