"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Boda {
  _id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  detalles: string;
  whatsappNumber: string;
  backupNumbers: string[];
}

export default function BodaDetalles() {
  const [boda, setBoda] = useState<Boda | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const bodaId = params.id as string;

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

    // Obtener los detalles de la boda
    const fetchBoda = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:4000/api/bodas/${bodaId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la boda.");
        }

        const data = await response.json();
        setBoda(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchBoda();
  }, [bodaId, router]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}

      {boda ? (
        <>
          <h2 className="text-2xl font-bold">💍 {boda.nombre}</h2>
          <p className="text-gray-600">📅 {new Date(boda.fecha).toLocaleDateString()}</p>
          <p className="text-gray-600">📍 {boda.ubicacion}</p>
          <p className="text-gray-600">📞 {boda.whatsappNumber}</p>
          <p className="text-gray-600">📋 {boda.detalles || "Sin detalles"}</p>
          {boda.backupNumbers.length > 0 && (
            <p className="text-gray-600">📞 Números de respaldo: {boda.backupNumbers.join(", ")}</p>
          )}
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
