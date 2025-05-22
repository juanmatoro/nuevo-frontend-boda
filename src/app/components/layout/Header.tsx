"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Usuario {
  _id: string;
  nombre: string;
  tipoUsuario: string;
}

export default function Header() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        🎉 Bodas App
      </Link>

      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:text-gray-300">
              🏠 Inicio
            </Link>
          </li>

          {usuario ? (
            <>
              {usuario.tipoUsuario === "admin" ? (
                <>
                  <li>
                    <Link href="/dashboard" className="hover:text-gray-300">
                      📊 Dashboard Admin
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li></li>
                </>
              )}

              {/* Nombre del usuario */}
              <li className="font-semibold">
                <Link
                  href={
                    usuario.tipoUsuario === "admin"
                      ? "/dashboard/"
                      : "/dashboard/noviosDashboard"
                  }
                  className="hover:text-gray-300"
                >
                  👤 {usuario.nombre} ({usuario.tipoUsuario})
                </Link>
              </li>

              {/* Botón de cerrar sesión */}
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  🚪 Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className="hover:text-gray-300">
                  🔐 Iniciar Sesión
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
