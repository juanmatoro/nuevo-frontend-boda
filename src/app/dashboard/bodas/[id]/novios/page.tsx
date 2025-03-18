"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Novio {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
}

export default function NoviosPage() {
  const [novios, setNovios] = useState<Novio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const bodaId = params.id as string;

  useEffect(() => {
    const fetchNovios = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:4000/api/bodas/${bodaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar los novios.");
        }

        const data = await response.json();
        setNovios(data.novios || []);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchNovios();
  }, [bodaId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold">👰🤵 Novios de la Boda</h2>

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
