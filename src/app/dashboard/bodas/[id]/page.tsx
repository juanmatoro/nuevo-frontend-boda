"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/services/axiosInstance";

interface Boda {
  _id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  detalles: string;
  whatsappNumber: string;
  backupNumbers: string[];
  novios: { _id: string; nombre: string }[];
  invitados: { _id: string; nombre: string }[];
  listasDifusion: string[];
  formularios: string[];
  fotos: string[];
}

export default function BodaDetalles() {
  const [boda, setBoda] = useState<Boda | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Boda | null>(null);
  const router = useRouter();
  const params = useParams();
  const bodaId = params.id as string;

  useEffect(() => {
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

    const fetchBoda = async () => {
      try {
        const response = await axiosInstance.get(`/bodas/${bodaId}`);
        setBoda(response.data);
        setFormData(response.data);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Error al cargar la boda.";
        setError(msg);
      }
    };

    fetchBoda();
  }, [bodaId, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axiosInstance.put(`/bodas/${bodaId}`, formData);
      setBoda(response.data);
      setIsEditing(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar la boda.";
      setError(msg);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}

      {boda ? (
        <>
          <h2 className="text-2xl font-bold">💍 {boda.nombre}</h2>
          <p className="text-gray-600">
            📅 {new Date(boda.fecha).toLocaleDateString()}
          </p>
          <p className="text-gray-600">📍 {boda.ubicacion}</p>
          <p className="text-gray-600">📞 {boda.whatsappNumber}</p>
          <p className="text-gray-600">📋 {boda.detalles || "Sin detalles"}</p>

          <h3 className="mt-4 font-semibold">👰 Novios:</h3>
          <ul className="list-disc pl-6">
            {boda.novios.map((novio) => (
              <li key={novio._id}>{novio.nombre}</li>
            ))}
          </ul>

          <h3 className="mt-4 font-semibold">🎉 Invitados:</h3>
          <p>{boda.invitados.length} invitados</p>

          <h3 className="mt-4 font-semibold">📂 Listas de difusión:</h3>
          <p>{boda.listasDifusion.length} listas</p>

          <h3 className="mt-4 font-semibold">📜 Formularios:</h3>
          <p>{boda.formularios.length} formularios</p>

          <h3 className="mt-4 font-semibold">📸 Galería de fotos:</h3>
          <p>{boda.fotos.length} fotos</p>

          <button
            onClick={handleEdit}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            ✏️ Editar Boda
          </button>

          {isEditing && formData && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">✏️ Editar Boda</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-medium">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Fecha</label>
                    <input
                      type="date"
                      name="fecha"
                      value={
                        new Date(formData.fecha).toISOString().split("T")[0]
                      }
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Ubicación</label>
                    <input
                      type="text"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Detalles</label>
                    <textarea
                      name="detalles"
                      value={formData.detalles}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">
                      Número de WhatsApp
                    </label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="bg-gray-400 text-white px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
