/* "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Novio {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipoUsuario: string;
  bodaId: string;
  bodaNombre: string;
  bodaFecha: string;
  bodaLugar: string;
}

export default function NoviosPage() {
  const [novios, setNovios] = useState<Novio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNovios = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los novios.");
        }

        const data = await response.json();
        const noviosFiltrados = data.filter((usuario: Novio) =>
          ["novio", "novia"].includes(usuario.tipoUsuario)
        );

        setNovios(noviosFiltrados);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchNovios();
  }, []);

  return (
    <div className=" bg-white p-6 rounded-lg shadow-md">
        <div className=""               ></div>
<Link href="/dashboard/novios/nuevo" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" >
  ➕ Añadir Novio
</Link>

      <h2 className="text-2xl font-bold">👰🤵 Lista de Novios</h2>

      {error && <p className="text-red-500">{error}</p>}

      {novios.length === 0 ? (
        <p>No hay novios registrados.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {novios.map((novio) => (
            <li key={novio._id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">{novio.nombre}</p>
                <p className="text-gray-600">📧 {novio.email}</p>
                <p className="text-gray-600">📞 {novio.telefono}</p>
              </div>
              <Link
                href={`/dashboard/novios/${novio._id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Ver detalles
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Novio {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  bodaId: string;
}

interface Boda {
  _id: string;
  nombre: string;
}

export default function ListaNovios() {
  const [novios, setNovios] = useState<Novio[]>([]);
  const [bodas, setBodas] = useState<{ [key: string]: string }>({}); // Mapeo bodaId -> nombreBoda
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNovios = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Obtener todos los novios
        const response = await fetch("http://localhost:4000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener novios");

        const data = await response.json();

        // Filtrar solo novios y novias
        const noviosFiltrados = data.filter((usuario: Novio) =>
          ["novio", "novia"].includes(usuario.tipoUsuario)
        );

        setNovios(noviosFiltrados);

        // 2️⃣ Obtener los nombres de las bodas
        const uniqueBodaIds = [...new Set(noviosFiltrados.map((novio) => novio.bodaId))];

        const bodaPromises = uniqueBodaIds.map(async (bodaId) => {
          const bodaResponse = await fetch(`http://localhost:4000/api/bodas/${bodaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (bodaResponse.ok) {
            const bodaData = await bodaResponse.json();
            return { id: bodaId, nombre: bodaData.nombre };
          }
          return { id: bodaId, nombre: "Boda Desconocida" };
        });

        const bodasData = await Promise.all(bodaPromises);

        // Crear un objeto { bodaId: nombreBoda }
        const bodasMap = bodasData.reduce((acc, boda) => {
          acc[boda.id] = boda.nombre;
          return acc;
        }, {} as { [key: string]: string });

        setBodas(bodasMap);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchNovios();
  }, []);

  // 3️⃣ Agrupar novios por bodaId
  const noviosAgrupados = novios.reduce((acc, novio) => {
    if (!acc[novio.bodaId]) {
      acc[novio.bodaId] = [];
    }
    acc[novio.bodaId].push(novio);
    return acc;
  }, {} as { [key: string]: Novio[] });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="">
      <Link href="/dashboard/novios/nuevo" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded" >
  ➕ Añadir Novio
</Link>
      </div>

      <h2 className="text-2xl font-bold">👰🤵 Lista de Novios Agrupados por Boda</h2>

      {error && <p className="text-red-500">{error}</p>}

      {Object.keys(noviosAgrupados).length === 0 ? (
        <p>No hay novios registrados.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {Object.entries(noviosAgrupados).map(([bodaId, novios]) => (
            <div key={bodaId} className="border p-4 rounded-lg bg-gray-100">
              {/* 4️⃣ Pintar el nombre de la boda como encabezado */}
              <h3 className="text-xl font-bold text-blue-600">
                💍 {bodas[bodaId] || "Boda Desconocida"}
              </h3>

              {/* Lista de novios de esta boda */}
              <ul className="mt-2 space-y-2">
                {novios.map((novio) => (
                  <li key={novio._id} className="flex justify-between items-center bg-white p-3 rounded-md shadow">
                    <div>
                      <p className="font-bold">{novio.nombre}</p>
                      <p className="text-gray-600">📧 {novio.email}</p>
                      <p className="text-gray-600">📞 {novio.telefono}</p>
                    </div>
                    <Link
                      href={`/dashboard/novios/${novio._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Ver detalles
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
