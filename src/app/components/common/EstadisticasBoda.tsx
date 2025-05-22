"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/services/axiosInstance";

interface Estadisticas {
  totalInvitados: number;
  pendientes: number;
  confirmados: number;
  rechazados: number;
}

export default function EstadisticasBoda() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const response = await axiosInstance.get("/estadisticas/boda");
        setEstadisticas(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Error al obtener estadísticas"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  if (loading) return <p>⏳ Cargando estadísticas...</p>;
  if (error) return <p className="text-red-500">❌ Error: {error}</p>;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">👥 Total Invitados</h3>
          <p className="text-xl font-bold">{estadisticas?.totalInvitados}</p>
        </div>
        <div className="p-4 bg-green-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">✅ Confirmados</h3>
          <p className="text-xl font-bold">{estadisticas?.confirmados}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">⏳ Pendientes</h3>
          <p className="text-xl font-bold">{estadisticas?.pendientes}</p>
        </div>
        <div className="p-4 bg-red-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">🚫 Rechazados</h3>
          <p className="text-xl font-bold">{estadisticas?.rechazados}</p>
        </div>
      </div>
    </div>
  );
}
