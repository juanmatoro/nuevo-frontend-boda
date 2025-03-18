"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Boda {
  _id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  whatsappNumber: string;
}

export default function BodasPage() {
  const [bodas, setBodas] = useState<Boda[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario es admin
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.tipoUsuario !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Obtener las bodas desde el backend
    const fetchBodas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/api/bodas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las bodas.");
        }

        const data = await response.json();
        setBodas(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchBodas();
  }, [router]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <Link
  href="/dashboard/bodas/nueva"
  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
>
  ➕ Nueva Boda
</Link>
      <h2 className="text-2xl font-bold">💍 Lista de Bodas</h2>

      {error && <p className="text-red-500">{error}</p>}

      {bodas.length === 0 ? (
        <p>No hay bodas registradas.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {bodas.map((boda) => (
            <li key={boda._id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">{boda.nombre}</p>
                <p className="text-gray-600">📅 {new Date(boda.fecha).toLocaleDateString()}</p>
                <p className="text-gray-600">📍 {boda.ubicacion}</p>
                <p className="text-gray-600">📞 {boda.whatsappNumber}</p>
              </div>
              <button
                onClick={() => window.open(`/dashboard/bodas/${boda._id}`, "_blank")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Ver detalles
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
