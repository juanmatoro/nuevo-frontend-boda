"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Modal from "@/app/components/ui/Modal";

interface Pregunta {
  _id: string;
  pregunta: string;
  opciones: string[];
}

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
}

interface Formulario {
  _id: string;
  nombre: string;
  enviadosA: Invitado[] | string[]; // Puede ser invitados o una lista (string ID)
  preguntas: Pregunta[];
  completado: boolean;
}

export default function FormulariosDashboard() {
  const { bodaId } = useParams();
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [destinatario, setDestinatario] = useState<"lista" | "invitados">("lista");
  const [listas, setListas] = useState<{ _id: string; nombre: string }[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [selectedInvitados, setSelectedInvitados] = useState<string[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !bodaId) return;

      try {
        // Formularios
        const response = await fetch(`http://localhost:4000/api/forms/forms/${bodaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setFormularios(data);

        // Invitados
        const invitadosRes = await fetch(
          `http://localhost:4000/api/guests/invitados/${bodaId}?limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const invitadosData = await invitadosRes.json();
        setInvitados(invitadosData.invitados || []);

        // Listas
        const listasRes = await fetch(`http://localhost:4000/api/lists/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listasData = await listasRes.json();
        setListas(listasData || []);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bodaId, token]);

  const handleOpenModal = (formId: string) => {
    setSelectedForm(formId);
    setModalOpen(true);
  };

  const enviarFormulario = async () => {
    if (!selectedForm) return;

    const destinatarios =
      destinatario === "lista" ? selectedList : selectedInvitados;

    if (!destinatarios || destinatarios.length === 0) {
      alert("Debes seleccionar una lista o invitados.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/forms/forms/${selectedForm}/enviar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ destinatarios }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("✅ Formulario enviado con éxito.");
        setModalOpen(false);
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error al enviar el formulario:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Formularios de la Boda</h2>

      <Link
        href={`/dashboard/formularios/${bodaId}/crearFormulario`}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 inline-block"
      >
        ➕ Crear Nuevo Formulario
      </Link>

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : formularios.length > 0 ? (
        <div className="overflow-y-auto max-h-[70vh] p-2 border border-gray-300 rounded-lg">
          <ul className="mt-4 space-y-4">
            {formularios.map((formulario) => (
              <li key={formulario._id} className="border p-4 rounded-lg">
                <h3 className="font-bold">📝 Formulario: {formulario.nombre}</h3>
                <p>📌 Estado: {formulario.completado ? "✅ Completado" : "⏳ Pendiente"}</p>

                {/* Preguntas */}
                <h4 className="font-semibold mt-2">📄 Preguntas:</h4>
                <ul className="list-disc pl-5">
                  {formulario.preguntas.map((pregunta) => (
                    <li key={pregunta._id}>{pregunta.pregunta}</li>
                  ))}
                </ul>

                {/* Enviado a */}
                <h4 className="font-semibold mt-2">👤 Enviado a:</h4>
                <ul className="list-disc pl-5">
                  {Array.isArray(formulario.enviadosA) &&
                  typeof formulario.enviadosA[0] === "string" ? (
                    <li>
                      Lista de difusión:{" "}
                      {listas.find((l) => l._id === formulario.enviadosA[0])?.nombre ||
                        "Lista desconocida"}
                    </li>
                  ) : (
                    (formulario.enviadosA as Invitado[]).map((invitado) => (
                      <li key={invitado._id}>
                        {invitado.nombre} ({invitado.telefono})
                      </li>
                    ))
                  )}
                </ul>

                {/* Botón enviar */}
                <button
                  onClick={() => handleOpenModal(formulario._id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded mt-3"
                >
                  ✉️ Enviar Formulario
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-600">No hay formularios registrados.</p>
      )}

      {/* ✅ Modal reutilizable */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedForm(null);
        }}
        title="✉️ Enviar Formulario"
      >
        <div>
          {/* Método de envío */}
          <label className="block mb-2 font-semibold">📤 Enviar a:</label>
          <div className="mb-4">
            <label className="mr-4">
              <input
                type="radio"
                name="destinatario"
                value="lista"
                checked={destinatario === "lista"}
                onChange={() => setDestinatario("lista")}
              />
              <span className="ml-1">Lista de difusión</span>
            </label>
            <label>
              <input
                type="radio"
                name="destinatario"
                value="invitados"
                checked={destinatario === "invitados"}
                onChange={() => setDestinatario("invitados")}
              />
              <span className="ml-1">Invitados</span>
            </label>
          </div>

          {/* Selects según modo */}
          {destinatario === "lista" ? (
            <select
              value={selectedList || ""}
              onChange={(e) => setSelectedList(e.target.value)}
              className="border p-2 w-full"
            >
              <option value="">Selecciona una lista</option>
              {listas.map((lista) => (
                <option key={lista._id} value={lista._id}>
                  {lista.nombre}
                </option>
              ))}
            </select>
          ) : (
            <select
              multiple
              value={selectedInvitados}
              onChange={(e) =>
                setSelectedInvitados(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="border p-2 w-full"
            >
              {invitados.map((inv) => (
                <option key={inv._id} value={inv._id}>
                  {inv.nombre}
                </option>
              ))}
            </select>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={enviarFormulario}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              ✅ Enviar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
