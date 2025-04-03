"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  obtenerPlantillas,
  crearPlantilla,
  editarPlantilla,
  eliminarPlantilla,
} from "@/services/plantillasService";

interface Plantilla {
  _id: string;
  nombre: string;
  contenido: string;
}

export default function PlantillasSection() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = (await obtenerPlantillas()) as Plantilla[];
        setPlantillas(data);
      } catch (error) {
        toast.error("Error al obtener las plantillas");
      }
    };
    fetchData();
  }, []);

  const handleCrear = async () => {
    if (!nombre || !contenido) return;
    try {
      const nueva = (await crearPlantilla(nombre, contenido)) as Plantilla;
      setPlantillas([...plantillas, nueva]);
      setNombre("");
      setContenido("");
      toast.success("Plantilla creada");
    } catch (error) {
      toast.error("Error al crear la plantilla");
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await eliminarPlantilla(id);
      setPlantillas(plantillas.filter((p) => p._id !== id));
      toast.success("Plantilla eliminada");
    } catch (error) {
      toast.error("Error al eliminar la plantilla");
    }
  };

  return (
    <div className="border rounded p-4 shadow space-y-4">
      <h3 className="text-lg font-bold">✏️ Plantillas de mensaje</h3>

      <div className="flex flex-col gap-2">
        <input
          className="border rounded px-3 py-2"
          placeholder="Nombre de la plantilla"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <textarea
          className="border rounded px-3 py-2"
          rows={3}
          placeholder="Contenido del mensaje"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={handleCrear}
        >
          ➕ Crear plantilla
        </button>
      </div>

      <ul className="divide-y">
        {plantillas.map((p) => (
          <li key={p._id} className="py-2 flex justify-between items-start">
            <div>
              <p className="font-semibold">📌 {p.nombre}</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {p.contenido}
              </p>
            </div>
            <button
              onClick={() => handleEliminar(p._id)}
              className="text-red-500 hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
