// src/services/apiClient.ts
import axios from "axios";

// 1. Crear la instancia de Axios con la URL base de tu API principal
const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://api.celebra-conmigo.com/api", // Asegúrate de que esta URL sea la correcta para tu API
});

// 2. Añadir el INTERCEPTOR de peticiones
// Esta función se ejecutará automáticamente ANTES de cada petición que se haga con 'apiClient'
apiClient.interceptors.request.use(
  (config) => {
    // Nos aseguramos de que este código solo se ejecute en el navegador
    if (typeof window !== "undefined") {
      // Obtenemos el token que guardaste en localStorage después del login del "novio"
      const token = localStorage.getItem("token");

      // Si el token existe, lo añadimos a la cabecera 'Authorization'
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // Manejar un error en la configuración de la petición
    return Promise.reject(error);
  }
);

export default apiClient;
