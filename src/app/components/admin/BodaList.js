"use client";
import { useBodas } from "../../hooks/useBodas";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BodaList() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const { bodas, loading, error } = useBodas(token);

  if (loading) return <p>Cargando bodas...</p>;
  if (error) return <p>Error al cargar bodas: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Bodas</h2>
      {bodas.length === 0 ? (
        <p>No hay bodas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {bodas.map((boda) => (
            <li
              key={boda._id}
              className="border p-2 rounded flex justify-between"
            >
              <span>
                💍 {boda.nombre} - 📅{" "}
                {new Date(boda.fecha).toLocaleDateString()}
              </span>
              <Link href={`/admin/bodas/editar?id=${boda._id}`}>
                <button className="bg-blue-500 text-white px-3 py-1 rounded">
                  Ver detalles
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
