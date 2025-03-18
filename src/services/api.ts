const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchData = async (endpoint: string, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status}`);
  }
  return response.json();
};
