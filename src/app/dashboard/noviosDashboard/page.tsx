"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/axiosInstance";

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipoUsuario: string;
  bodaId: string;
}

interface Boda {
  _id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
}

export default function DashboardNovio() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [boda, setBoda] = useState<Boda | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (!token || !storedUser) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(storedUser);
        if (!["novio", "novia"].includes(user.tipoUsuario)) {
          router.push("/noviosDasboard");
          return;
        }

        setUsuario(user);

        const response = await axiosInstance.get(`/bodas/${user.bodaId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBoda(response.data);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Error al cargar la boda.";
        setError(msg);
      }
    };

    fetchUsuario();
  }, [router]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}

      {usuario && boda ? (
        <>
          <h2 className="text-2xl font-bold">
            🎉 Bienvenido, {usuario.nombre}
          </h2>
          <p className="text-gray-600">💍 Tu boda: {boda.nombre}</p>
          <p className="text-gray-600">
            📅 Fecha: {new Date(boda.fecha).toLocaleDateString()}
          </p>
          <p className="text-gray-600">📍 Ubicación: {boda.ubicacion}</p>
          <br />
          <p className="text-gray-600">
            📌 Desde el menú de la izquierda podrás realizar las gestiones de tu
            boda, si tienes alguna duda o algún comentario consulta con tu
            admin.
          </p>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
