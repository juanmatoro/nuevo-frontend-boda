"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoInvitado() {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    invitadoDe: "Novio", // Valor por defecto
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      if (!user.bodaId) {
        throw new Error("No tienes una boda asociada.");
      }

      const response = await fetch("http://localhost:4000/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, bodaId: user.bodaId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al agregar el invitado.");
      }

      setSuccess("✅ Invitado agregado con éxito.");
      setTimeout(() => router.push("/dashboard/noviosDashboard/invitados"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">➕ Añadir Invitado</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

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

        <div>
          <label className="block font-medium">Invitado de</label>
          <select
            name="invitadoDe"
            value={formData.invitadoDe}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="Novio">Novio</option>
            <option value="Novia">Novia</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Guardar Invitado
        </button>
      </form>
    </div>
  );
}
