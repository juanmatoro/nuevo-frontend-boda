"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ nombre: string; tipoUsuario: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login"); // Redirigir al login si no hay usuario autenticado
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  return (
    <div className="flex h-screen">
      {/* Sidebar de navegación */}
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold">📊 Dashboard</h2>
        <nav>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard" className="hover:text-gray-300">🏠 Inicio</Link>
            </li>
            <li>
              <Link href="/dashboard/perfil" className="hover:text-gray-300">👤 Perfil</Link>
            </li>
            <li>
              <Link href="/dashboard/bodas" className="hover:text-gray-300">💍 Bodas</Link>
            </li>
            <li>
              <Link href="/dashboard/novios" className="hover:text-gray-300">👰‍♀️🤵🏻‍♂️ Novios</Link>
            </li>
            <li>
              <Link href="/dashboard/invitados" className="hover:text-gray-300">🎉 Invitados</Link>
            </li>
            <li>
              <Link href="/dashboard/configuracion" className="hover:text-gray-300">⚙ Configuración</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-grow p-6">{children}</main>
    </div>
  );
}
