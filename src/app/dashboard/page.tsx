"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<{ nombre: string; tipoUsuario: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      {user ? (
        <>
          <h2 className="text-2xl font-bold">Bienvenido, {user.nombre}! 👋</h2>
          <p className="text-gray-600">Tu rol: {user.tipoUsuario}</p>
          <p className="mt-4">Selecciona una opción en el menú de la izquierda.</p>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
