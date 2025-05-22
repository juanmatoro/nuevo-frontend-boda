"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Token de prueba (copiado de Postman)
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDQwNDVhZTRjYTUwMWJmNzk5OGFiYSIsInRpcG9Vc3VhcmlvIjoiYWRtaW4iLCJpYXQiOjE3NDIyOTYyOTksImV4cCI6MTc0NDg4ODI5OX0.x6eF12sDIPBpnOBkkK7CDO6fMxM-hzUVymYQOKS-7pQ"; // Reemplaza con tu token real

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/test", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      setData(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">🔍 Prueba de Conexión</h1>
      <button
        onClick={fetchData}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        🔄 Probar conexión
      </button>
      <pre className="mt-4 p-4 bg-gray-100 border">
        {data || error || "Cargando..."}
      </pre>
    </div>
  );
}
