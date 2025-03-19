"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Boda {
  _id: string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  detalles: string;
}

export default function EditarBoda() {
  const [boda, setBoda] = useState<Boda | null>(null);
  const [formData, setFormData] = useState<Boda>({
    _id: "",
    nombre: "",
    fecha: "",
    ubicacion: "",
    detalles: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

        const response = await fetch(`http://localhost:4000/api/bodas/${user.bodaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("No se pudieron obtener los datos de la boda.");
        }

        const data = await response.json();
        setBoda(data);
        setFormData(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchBoda();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:4000/api/bodas/${boda?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar los datos de la boda.");
      }

      setSuccess("✅ Boda actualizada con éxito.");
      setTimeout(() => router.push("/dashboard/novio/mi-boda"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">✏️ Editar Boda</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      {boda && (
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
              value={formData.fecha.split("T")[0]} // Formato YYYY-MM-DD
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

          <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Guardar Cambios
          </button>
        </form>
      )}
    </div>
  );
}
