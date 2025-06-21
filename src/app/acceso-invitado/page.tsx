// src/app/acceso-invitado/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccesoInvitadoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Obtiene el token del parámetro 'token' en la URL
    const token = searchParams.get("token");

    if (token) {
      // 2. Guarda el token de forma segura en localStorage
      // Este token se usará para autenticar todas las futuras peticiones del invitado.
      localStorage.setItem("token", token);

      // 3. Limpia el token de la URL y redirige al panel principal del invitado.
      // Esto es importante por seguridad y para tener una URL limpia.
      // Usamos router.replace para que el usuario no pueda volver atrás a esta página.
      router.replace("/invitado/panel");
    } else {
      // Si no hay token, redirige a una página de error o a la home.
      console.error(
        "No se encontró token en la URL para el acceso de invitado."
      );
      router.replace("/enlace-invalido");
    }
  }, [router, searchParams]);

  // Muestra un mensaje de carga mientras se procesa la redirección.
  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg">Autenticando, por favor espera...</p>
    </div>
  );
}
