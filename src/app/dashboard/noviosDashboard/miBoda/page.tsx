"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EstadisticasBoda from "@/app/components/common/EstadisticasBoda";
import axiosInstance from "@/services/axiosInstance";

interface Boda {
  _id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  detalles: string;
  whatsappNumber: string;
}

export default function MiBoda() {
  const [boda, setBoda] = useState<Boda | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBoda = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(storedUser);

        if (!user.bodaId) {
          setError("No tienes una boda asociada.");
          return;
        }

        const response = await axiosInstance.get(`/bodas/${user.bodaId}`);
        setBoda(response.data);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Error al cargar la boda.";
        setError(msg);
      }
    };

    fetchBoda();
  }, [router]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">💍 Mi Boda</h2>

      {error && <p className="text-red-500">{error}</p>}

      {boda ? (
        <div className="mt-4 space-y-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-gray-600">
              <strong>📛 Nombre:</strong> {boda.nombre}
            </p>
            <p className="text-gray-600">
              <strong>📅 Fecha:</strong>{" "}
              {new Date(boda.fecha).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <strong>📞 WhatsApp:</strong> {boda.whatsappNumber}
            </p>
            <p className="text-gray-600">
              <strong>📍 Ubicación:</strong> {boda.ubicacion}
            </p>
            <p className="text-gray-600">
              <strong>📜 Detalles:</strong> {boda.detalles || "Sin detalles"}
            </p>
          </div>

          <div className="bg-green-100 p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">📊 Gestión de Invitados</h2>
            <EstadisticasBoda />
          </div>

          <Link
            href="/dashboard/noviosDashboard/miBoda/editar"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            ✏️ Editar Boda
          </Link>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
