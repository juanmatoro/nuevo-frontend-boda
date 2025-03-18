"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState<{ nombre: string; tipoUsuario: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Intentar recuperar el usuario desde localStorage
    const storedUser = localStorage.getItem("user");
    // console.log(storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Eliminar token
    localStorage.removeItem("user"); // Eliminar usuario
    setUser(null); // Actualizar el estado
    router.push("/login"); // Redirigir al login
  };

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      {/* Logo o Título */}
      <Link href="/" className="text-xl font-bold hover:text-gray-300">
        🎉 BodasApp
      </Link>

      {/* Menú de navegación */}
      <nav>
        <ul className="flex items-center space-x-4">
          {/* Botón de Inicio */}
          <li>
            <Link href="/" className="hover:text-gray-300">
              🏠 Inicio
            </Link>
          </li>

          {user ? (
            <>
              {/* Nombre del usuario con un icono */}
              <li className="font-semibold">
                <Link href="/dashboard" className="hover:text-gray-300">
                👤 {user.nombre} ({user.tipoUsuario})
                </Link>
              </li>

              {/* Botón de Cerrar sesión */}
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                >
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <li>
              {/* Enlace a Login */}
              <Link
                href="/login"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
              >
                Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
