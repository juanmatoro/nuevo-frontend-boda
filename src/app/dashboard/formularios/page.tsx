"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Boda {
  _id: string;
  nombre: string;
}

export default function FormulariosAdminPage() {
  const [bodas, setBodas] = useState<Boda[]>([]);

  useEffect(() => {
    const fetchBodas = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ Usuario no autenticado.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:4000/api/bodas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        setBodas(data);
      } catch (error) {
        console.error("❌ Error al obtener bodas:", error);
      }
    };

    fetchBodas();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📋 Gestión de Formularios (Admin)</h1>
      <p className="text-gray-700">Selecciona una boda para gestionar sus formularios.</p>

      <ul className="mt-4 space-y-4">
        {bodas.map((boda) => (
          <li key={boda._id} className="border p-4 rounded-lg flex justify-between items-center">
            <p>{boda.nombre}</p>
            <Link
              href={`/dashboard/formularios/${boda._id}`}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              📋 Ver Formularios
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
