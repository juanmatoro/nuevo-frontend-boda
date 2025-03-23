"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
  enviadosA: Invitado[];
  preguntas: Pregunta[];
  completado: boolean;
}

export default function FormulariosDashboard() {
  const { bodaId } = useParams();
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [destinatario, setDestinatario] = useState<"lista" | "invitados">("lista");
  const [listas, setListas] = useState<string[]>([]); // Listas de difusión disponibles
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [selectedInvitados, setSelectedInvitados] = useState<string[]>([]);

  useEffect(() => {
    const fetchFormularios = async () => {
      const token = localStorage.getItem("token");

      if (!token || !bodaId) {
        console.error("❌ Usuario no autenticado o bodaId no encontrado.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:4000/api/forms/forms/${bodaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();
        console.log("🔍 Formularios cargados:", data);
        setFormularios(data);
      } catch (error) {
        console.error("❌ Error al obtener formularios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormularios();
  }, [bodaId]);

  // Función para enviar formulario
  const enviarFormulario = async () => {
    if (!selectedForm) return;
    
    const token = localStorage.getItem("token");
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

      {/* Botón para crear un nuevo formulario */}
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
                <h3 className="font-bold">📝 Formulario ID: {formulario._id}</h3>
                <p>📌 Estado: {formulario.completado ? "✅ Completado" : "⏳ Pendiente"}</p>
                <div key={`preguntas-${formulario._id}`}>
                  
                {/* Listado de preguntas en el formulario */}
                <h4 className="font-semibold mt-2">📄 Preguntas:</h4>
                <ul className="list-disc pl-5">
                  {formulario.preguntas.map((pregunta) => (
                    <li key={pregunta._id}>{pregunta.pregunta}</li>
                  ))}
                </ul>
                </div> 
                <div key={`enviadosA-${formulario._id}`}>
                   {/* Invitados asignados */}
                <h4 className="font-semibold mt-2">👤 Enviado a:</h4>
                <ul className="list-disc pl-5">
                  {formulario.enviadosA.map((invitado) => (
                    <li key={invitado._id}>{invitado.nombre} ({invitado.telefono})</li>
                  ))}
                </ul>
                 
                 </div>    
               

                {/* Botón para enviar */}
                <button
                  onClick={() => setSelectedForm(formulario._id)}
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

      {/* Modal para elegir destinatarios */}
      {selectedForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-bold">✉️ Enviar Formulario</h3>

            {/* Opción de lista de difusión */}
            <label className="block mt-3">
              <input
                type="radio"
                name="destinatario"
                value="lista"
                checked={destinatario === "lista"}
                onChange={() => setDestinatario("lista")}
              />
              📢 Lista de difusión
            </label>

            {/* Seleccionar lista */}
            {destinatario === "lista" && (
              <select
                value={selectedList || ""}
                onChange={(e) => setSelectedList(e.target.value)}
                className="border p-2 w-full mt-2"
              >
                <option value="">Selecciona una lista</option>
                {listas.map((lista) => (
                  <option key={lista} value={lista}>{lista}</option>
                ))}
              </select>
            )}

            {/* Opción de invitados seleccionados */}
            <label className="block mt-3">
              <input
                type="radio"
                name="destinatario"
                value="invitados"
                checked={destinatario === "invitados"}
                onChange={() => setDestinatario("invitados")}
              />
              🎉 Invitados Seleccionados
            </label>

            {/* Seleccionar invitados */}
            {destinatario === "invitados" && (
              <select
                multiple
                value={selectedInvitados}
                onChange={(e) =>
                  setSelectedInvitados(Array.from(e.target.selectedOptions, (option) => option.value))
                }
                className="border p-2 w-full mt-2"
              >
                {invitados.map((inv) => (
                  <option key={inv._id} value={inv._id}>{inv.nombre}</option>
                ))}
              </select>
            )}

            <button onClick={enviarFormulario} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
              ✅ Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
