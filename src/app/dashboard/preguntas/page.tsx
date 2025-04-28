"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/ui/Modal";
import {
  obtenerPreguntasPorBoda,
  editarPregunta,
  eliminarPregunta,
} from "@/services/preguntasService";

interface Pregunta {
  _id: string;
  pregunta: string;
  opciones: string[];
  esObligatoria: boolean;
  esConfirmacionAsistencia?: boolean;
}

export default function ListaPreguntasPage() {
  const { bodaId } = useParams();
  const router = useRouter();

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [preguntaSeleccionada, setPreguntaSeleccionada] =
    useState<Pregunta | null>(null);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevasOpciones, setNuevasOpciones] = useState<string[]>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [esObligatoria, setEsObligatoria] = useState(false);
  const [esConfirmacionAsistencia, setEsConfirmacionAsistencia] =
    useState(false);

  useEffect(() => {
    if (bodaId) cargarPreguntas();
  }, [bodaId]);

  const cargarPreguntas = async () => {
    try {
      const data = await obtenerPreguntasPorBoda(bodaId as string);
      setPreguntas(data as Pregunta[]);
    } catch (error) {
      console.error("❌ Error al cargar preguntas:", error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta pregunta?")) return;

    try {
      await eliminarPregunta(id);
      setPreguntas((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("❌ Error al eliminar pregunta:", error);
    }
  };

  const abrirModalEdicion = (pregunta: Pregunta) => {
    setPreguntaSeleccionada(pregunta);
    setNuevaPregunta(pregunta.pregunta);
    setNuevasOpciones(pregunta.opciones);
    setEsObligatoria(pregunta.esObligatoria);
    setEsConfirmacionAsistencia(pregunta.esConfirmacionAsistencia || false);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setPreguntaSeleccionada(null);
    setNuevaPregunta("");
    setNuevasOpciones([]);
    setEsObligatoria(false);
    setEsConfirmacionAsistencia(false);
  };

  const agregarOpcion = () => {
    if (nuevaOpcion.trim()) {
      setNuevasOpciones([...nuevasOpciones, nuevaOpcion.trim()]);
      setNuevaOpcion("");
    }
  };

  const guardarCambios = async () => {
    if (!preguntaSeleccionada) return;

    try {
      await editarPregunta(preguntaSeleccionada._id, {
        pregunta: nuevaPregunta,
        opciones: nuevasOpciones,
        esObligatoria,
        esConfirmacionAsistencia,
      });

      cerrarModal();
      cargarPreguntas();
    } catch (error) {
      console.error("❌ Error al actualizar pregunta:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📋 Preguntas de la Boda</h2>
        <button
          onClick={() => router.push(`/dashboard/preguntas/${bodaId}`)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Nueva pregunta
        </button>
      </div>

      {preguntas.length === 0 ? (
        <p>No hay preguntas registradas aún.</p>
      ) : (
        <ul className="space-y-4">
          {preguntas.map((p) => (
            <li
              key={p._id}
              className="border p-4 rounded shadow-sm flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{p.pregunta}</p>
                <ul className="text-sm text-gray-600 mt-1 list-disc ml-5">
                  {p.opciones.map((op, idx) => (
                    <li key={idx}>{op}</li>
                  ))}
                </ul>
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => abrirModalEdicion(p)}
                  className="text-blue-600 hover:underline"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleEliminar(p._id)}
                  className="text-red-600 hover:underline"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={showModal}
        onClose={cerrarModal}
        title="✏️ Editar Pregunta"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={nuevaPregunta}
            onChange={(e) => setNuevaPregunta(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Texto de la pregunta"
          />

          <div>
            <label className="block mb-1 font-medium">Opciones:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={nuevaOpcion}
                onChange={(e) => setNuevaOpcion(e.target.value)}
                className="flex-grow border p-2 rounded"
                placeholder="Nueva opción"
              />
              <button
                type="button"
                onClick={agregarOpcion}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                ➕ Añadir
              </button>
            </div>
            <ul className="mt-2 list-disc ml-5 text-sm text-gray-600">
              {nuevasOpciones.map((op, idx) => (
                <li key={idx}>{op}</li>
              ))}
            </ul>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={esObligatoria}
              onChange={(e) => setEsObligatoria(e.target.checked)}
            />
            <span>¿Es obligatoria?</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={esConfirmacionAsistencia}
              onChange={(e) => setEsConfirmacionAsistencia(e.target.checked)}
            />
            <span>¿Es de confirmación de asistencia?</span>
          </label>

          <div className="flex justify-end space-x-2">
            <button
              onClick={cerrarModal}
              className="px-4 py-2 rounded border border-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={guardarCambios}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              💾 Guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
