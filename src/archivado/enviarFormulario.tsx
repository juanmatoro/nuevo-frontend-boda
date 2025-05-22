"use client";

import { useState, useEffect } from "react";

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
}

export default function EnviarFormulario() {
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [selectedInvitado, setSelectedInvitado] = useState("");

  useEffect(() => {
    const fetchInvitados = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const bodaId = user.bodaId;
      if (!bodaId) return;

      try {
        const response = await fetch(`http://localhost:4000/api/guests/invitados/${bodaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setInvitados(data.invitados);
      } catch (error) {
        console.error("❌ Error al obtener invitados:", error);
      }
    };

    fetchInvitados();
  }, []);

  const enviarFormulario = async () => {
    if (!selectedInvitado) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:4000/api/forms/enviar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invitadoId: selectedInvitado }),
      });
      alert("✅ Formulario enviado correctamente.");
    } catch (error) {
      console.error("❌ Error al enviar formulario:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📨 Enviar Formulario</h2>
      <select value={selectedInvitado} onChange={(e) => setSelectedInvitado(e.target.value)}>
        <option value="">Seleccione un invitado</option>
        {invitados.map((inv) => (
          <option key={inv._id} value={inv._id}>
            {inv.nombre} - {inv.telefono}
          </option>
        ))}
      </select>
      <button onClick={enviarFormulario} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
        📩 Enviar
      </button>
    </div>
  );
}
