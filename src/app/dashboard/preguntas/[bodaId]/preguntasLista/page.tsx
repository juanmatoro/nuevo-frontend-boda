"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/app/components/ui/Modal";
import {
  obtenerPreguntasPorBoda,
  editarPregunta,
  eliminarPregunta,
  crearPregunta,
} from "@/services/preguntasService";
import { text } from "stream/consumers";

interface SubPregunta {
  texto: string;
  opciones: string[];
}

interface Pregunta {
  _id: string;
  pregunta: string;
  opciones: string[];
  esObligatoria: boolean;
  esConfirmacionAsistencia?: boolean;
  subPregunta?: SubPregunta | null;
}

export default function ListaPreguntasPage() {
  const { bodaId } = useParams();
  const router = useRouter();

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [preguntaSeleccionada, setPreguntaSeleccionada] =
    useState<Pregunta | null>(null);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [nuevasOpciones, setNuevasOpciones] = useState<string[]>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [esObligatoria, setEsObligatoria] = useState(false);
  const [esConfirmacionAsistencia, setEsConfirmacionAsistencia] =
    useState(false);

  const [showCrearModal, setShowCrearModal] = useState(false);
  const [nuevaPreguntaTexto, setNuevaPreguntaTexto] = useState("");
  const [nuevaOpcionTexto, setNuevaOpcionTexto] = useState("");
  const [nuevasOpcionesCrear, setNuevasOpcionesCrear] = useState<string[]>([]);
  const [esObligNueva, setEsObligNueva] = useState(false);
  const [esConfirmNueva, setEsConfirmNueva] = useState(false);

  useEffect(() => {
    if (bodaId) cargarPreguntas();
  }, [bodaId]);

  const cargarPreguntas = async () => {
    try {
      const data = (await obtenerPreguntasPorBoda(
        bodaId as string
      )) as Pregunta[];
      setPreguntas(data);
    } catch (error) {
      console.error("❌ Error al cargar preguntas:", error);
    }
  };

  const abrirModalEdicion = (pregunta: Pregunta) => {
    setPreguntaSeleccionada(pregunta);
    setNuevaPregunta(pregunta.pregunta);
    setNuevasOpciones(pregunta.opciones);
    setEsObligatoria(pregunta.esObligatoria);
    setEsConfirmacionAsistencia(pregunta.esConfirmacionAsistencia || false);
    setShowEditarModal(true);
  };

  const cerrarModalEdicion = () => {
    setShowEditarModal(false);
    setPreguntaSeleccionada(null);
    setNuevaPregunta("");
    setNuevasOpciones([]);
    setEsObligatoria(false);
    setEsConfirmacionAsistencia(false);
  };

  const agregarOpcionEdicion = () => {
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
      cerrarModalEdicion();
      cargarPreguntas();
    } catch (error) {
      console.error("❌ Error al actualizar pregunta:", error);
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    try {
      await eliminarPregunta(id);
      cargarPreguntas();
    } catch (error) {
      console.error("❌ Error al eliminar pregunta:", error);
    }
  };

  const guardarNuevaPregunta = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    const bodaId = user.bodaId;

    if (!bodaId || nuevasOpcionesCrear.length < 2) {
      alert("Debe haber al menos 2 opciones.");
      return;
    }

    try {
      await crearPregunta({
        bodaId,
        pregunta: nuevaPreguntaTexto,
        opciones: nuevasOpcionesCrear,
        esObligatoria: esObligNueva,
        esConfirmacionAsistencia: esConfirmNueva,
      });

      setShowCrearModal(false);
      setNuevaPreguntaTexto("");
      setNuevaOpcionTexto("");
      setNuevasOpcionesCrear([]);
      setEsObligNueva(false);
      setEsConfirmNueva(false);

      cargarPreguntas();
    } catch (error) {
      console.error("❌ Error al crear pregunta:", error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📋 Preguntas de la Boda</h2>
        <button
          onClick={() => setShowCrearModal(true)}
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
                {p.subPregunta && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p className="font-medium">
                      🔁 Subpregunta: {p.subPregunta.texto}
                    </p>
                    <ul className="list-disc ml-5">
                      {p.subPregunta.opciones.map((op, idx) => (
                        <li key={idx}>{op}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => abrirModalEdicion(p)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminar(p._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de Edición */}
      <Modal
        isOpen={showEditarModal}
        onClose={cerrarModalEdicion}
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
                onClick={agregarOpcionEdicion}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                ➕ Añadir
              </button>
            </div>
            <ul className="mt-2 list-disc ml-5 text-sm text-gray-600">
              <input
                type="text"
                value={preguntaSeleccionada?.textoSubPregunta || ""}
                onChange={(e) => setNuevaPregunta(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Texto de la pregunta"
              />
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
              onClick={cerrarModalEdicion}
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

      {/* Modal de Creación */}
      <Modal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        title="➕ Crear Nueva Pregunta"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={nuevaPreguntaTexto}
            onChange={(e) => setNuevaPreguntaTexto(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Texto de la nueva pregunta"
          />

          <div>
            <label className="block mb-1 font-medium">Opciones:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={nuevaOpcionTexto}
                onChange={(e) => setNuevaOpcionTexto(e.target.value)}
                className="flex-grow border p-2 rounded"
                placeholder="Nueva opción"
              />
              <button
                type="button"
                onClick={() => {
                  if (nuevaOpcionTexto.trim()) {
                    setNuevasOpcionesCrear([
                      ...nuevasOpcionesCrear,
                      nuevaOpcionTexto.trim(),
                    ]);
                    setNuevaOpcionTexto("");
                  }
                }}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                ➕ Añadir
              </button>
            </div>
            <ul className="mt-2 list-disc ml-5 text-sm text-gray-600">
              {nuevasOpcionesCrear.map((op, idx) => (
                <li key={idx}>{op}</li>
              ))}
            </ul>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={esObligNueva}
              onChange={(e) => setEsObligNueva(e.target.checked)}
            />
            <span>¿Es obligatoria?</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={esConfirmNueva}
              onChange={(e) => setEsConfirmNueva(e.target.checked)}
            />
            <span>¿Es de confirmación de asistencia?</span>
          </label>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowCrearModal(false)}
              className="px-4 py-2 rounded border border-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={guardarNuevaPregunta}
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              ✅ Guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
