/* "use client";

import UploadExcel from "@/app/components/common/UploadExcel";
import axiosInstance from "@/services/axiosInstance";
import { useState } from "react";

export default function UploadInvitadosPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (file: File, _data: any[]) => {
    console.log("📦 Archivo recibido en el front:", file); //
    setLoading(true);
    setMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("⚠ No hay token de autenticación.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const response = await axiosInstance.post(
        "guests/cargar-excel",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // ❗️No pongas Content-Type aquí, axios lo gestiona con FormData
          },
        }
      );

      const result = response.data;
      setMessage(
        `✅ Invitados agregados exitosamente: ${result.invitados.length}`
      );
    } catch (error: any) {
      console.error("❌ Error en la subida:", error);
      const mensaje =
        error?.response?.data?.message || "❌ Error al subir los invitados.";
      setMessage(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📂 Cargar Lista de Invitados</h1>
      <UploadExcel onUpload={handleUpload} />

      {loading && (
        <p className="text-blue-500 mt-4">⏳ Subiendo invitados...</p>
      )}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
 */

"use client";

import UploadExcel from "@/app/components/common/UploadExcel";
import axiosInstance from "@/services/axiosInstance";
import { useState } from "react";

export default function UploadInvitadosPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (file: File, _data: any[]) => {
    console.log("📦 Archivo recibido en el front:", file);
    setLoading(true);
    setMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("⚠ No hay token de autenticación.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const response = await axiosInstance.post(
        "/guests/actions/cargar-excel",
        formData
      );

      const { invitados, repetidos = [] } = response.data;

      let msg = `✅ Invitados agregados exitosamente: ${invitados.length}`;
      if (repetidos.length > 0) {
        msg += `\n⚠ Invitados repetidos (${repetidos.length}):\n`;
        msg += repetidos
          .map((i: any) => `• ${i.nombre} (${i.telefono})`)
          .join("\n");
      }

      setMessage(msg);
    } catch (error: any) {
      console.error("❌ Error en la subida:", error);
      const mensaje =
        error?.response?.data?.message || "❌ Error al subir los invitados.";
      setMessage(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📂 Cargar Lista de Invitados</h1>
      <UploadExcel onUpload={handleUpload} />

      {loading && (
        <p className="text-blue-500 mt-4">⏳ Subiendo invitados...</p>
      )}
      {message && (
        <pre className="mt-4 whitespace-pre-wrap text-sm text-gray-800 bg-gray-100 p-3 rounded-lg">
          {message}
        </pre>
      )}
    </div>
  );
}
