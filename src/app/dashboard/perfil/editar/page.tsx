"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
}

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<Usuario & { password?: string }>({
    _id: "",
    nombre: "",
    email: "",
    telefono: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setUsuario(user);
    setFormData({ ...user, password: "" }); // No cargamos la contraseña
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

/*   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const { password, ...dataToUpdate } = formData; // Separa la contraseña del resto de los datos

      // Si no hay contraseña, no la enviamos al backend
      if (!password) delete dataToUpdate.password;

      const response = await fetch(`http://localhost:4000/api/users/${usuario?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToUpdate),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar perfil.");
      }

      setSuccess("✅ Perfil actualizado con éxito.");
      localStorage.setItem("user", JSON.stringify(data.usuario)); // Actualizar el usuario en localStorage
    } catch (err: any) {
      setError(err.message);
    }
  }; */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
  
    try {
      const token = localStorage.getItem("token");
      
      // Crear una copia del objeto sin password si está vacío
      const dataToUpdate: any = { ...formData }; 
  
      if (!formData.password) {
        delete dataToUpdate.password;
      }
  
      const response = await fetch(`http://localhost:4000/api/users/${usuario?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToUpdate),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar perfil.");
      }
  
      setSuccess("✅ Perfil actualizado con éxito.");
      localStorage.setItem("user", JSON.stringify(data.usuario)); // Actualizar el usuario en localStorage
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-4">✏️ Editar Perfil</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      {formData._id ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block font-medium">Nueva Contraseña (opcional)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Guardar Cambios
          </button>
        </form>
      ) : (
        <p className="text-center">Cargando...</p>
      )}
    </div>
  );
}
