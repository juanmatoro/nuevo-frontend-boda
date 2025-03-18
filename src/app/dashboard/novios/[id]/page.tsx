"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Novio {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  bodaId: string;
}

export default function NovioDetalles() {
  const [novio, setNovio] = useState<Novio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Novio | null>(null);
  const router = useRouter();
  const params = useParams();
  const novioId = params.id as string;

  useEffect(() => {
    const fetchNovio = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:4000/api/users/${novioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("No se pudo cargar la información del novio.");
        }

        const data = await response.json();
        setNovio(data);
        setFormData(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchNovio();
  }, [novioId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/api/usuarios/${novioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar los datos.");
      }

      setNovio(data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}

      {novio ? (
        <>
          <h2 className="text-2xl font-bold">👤 {novio.nombre}</h2>
          <p className="text-gray-600">📧 {novio.email}</p>
          <p className="text-gray-600">📞 {novio.telefono}</p>

          <button
            onClick={handleEdit}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            ✏️ Editar Novio
          </button>

          {/* Modal de edición */}
          {isEditing && formData && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">✏️ Editar Novio</h2>

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
                    <label className="block font-medium">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button type="button" onClick={handleClose} className="bg-gray-400 text-white px-4 py-2 rounded">
                      Cancelar
                    </button>
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
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
