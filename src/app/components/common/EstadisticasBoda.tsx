"use client";

import { useState, useEffect } from "react";

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
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No hay token de autenticación.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/api/estadisticas/boda", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al obtener estadísticas");

        setEstadisticas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  if (loading) return <p>⏳ Cargando estadísticas...</p>;
  if (error) return <p className="text-red-500">❌ Error: {error}</p>;

  return (
    <div className="flexp-6 bg-white shadow-md rounded-lg p-4">
        
      <div className="grid grid-cols-3 gap-4">
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
        <div className="p-4 bg-yellow-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">🚫 Rechazados</h3>
          <p className="text-xl font-bold">{estadisticas?.rechazados}</p>
        </div>
      </div>
    </div>
  );
}
