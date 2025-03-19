"use client";
import UploadExcel from "@/app/components/common/UploadExcel";
import { useState } from "react";

export default function UploadInvitadosPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (file: File, data: any[]) => {
    setLoading(true);
    setMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("⚠ No hay token de autenticación.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("archivo", file); // 📂 Enviamos el archivo en FormData

      const response = await fetch("http://localhost:4000/api/guests/cargar-excel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // ✅ No se debe agregar "Content-Type", ya que FormData lo maneja automáticamente
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`✅ Invitados agregados exitosamente: ${result.invitados.length}`);
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error en la subida:", error);
      setMessage("❌ Error al subir los invitados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📂 Cargar Lista de Invitados</h1>
      <UploadExcel onUpload={handleUpload} />
      
      {loading && <p className="text-blue-500 mt-4">⏳ Subiendo invitados...</p>}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
