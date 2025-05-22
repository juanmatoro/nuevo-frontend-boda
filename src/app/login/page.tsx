"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/services/axiosInstance";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Resetear error

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 📌 Redirigir según el tipo de usuario
      if (data.user.tipoUsuario === "admin") {
        router.push("/dashboard");
      } else if (
        data.user.tipoUsuario === "novio" ||
        data.user.tipoUsuario === "novia"
      ) {
        router.push("/dashboard/noviosDashboard");
      } else {
        throw new Error("Tipo de usuario no reconocido");
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Error al iniciar sesión";
      setError(errorMsg);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar sesión</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
