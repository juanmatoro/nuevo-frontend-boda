"use client";

import { useEffect, useState } from "react";

export default function Perfil() {
  const [user, setUser] = useState<{ nombre: string; email: string; telefono: String; tipoUsuario: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {user ? (
        <>
          <h2 className="text-2xl font-bold">👤 Mi Perfil</h2>
          <p><strong>Nombre:</strong> {user.nombre}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Telefono:</strong> {user.telefono}</p>
          <p><strong>Rol:</strong> {user.tipoUsuario}</p>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
   
  );
}
