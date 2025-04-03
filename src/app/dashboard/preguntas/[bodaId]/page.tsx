"use client";
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
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Question } from "@/interfaces/preguntas";
import {
  obtenerPreguntasPorBoda,
  eliminarPregunta,
  editarPregunta,
} from "@/services/preguntasService";
import CrearPreguntaModal from "@/app/components/admin/CrearPreguntaModal";
import EditarPreguntaModal from "@/app/components/admin/EditarPreguntaModal";
import AsignarPreguntaModal from "@/app/components/admin/AsignarPreguntaModal";

export default function ListaPreguntasPage() {
  const { bodaId } = useParams();
  const [preguntas, setPreguntas] = useState<Question[]>([]);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [preguntaSeleccionada, setPreguntaSeleccionada] =
    useState<Question | null>(null);

  useEffect(() => {
    if (bodaId) {
      cargarPreguntas();
    }
  }, [bodaId]);

  const cargarPreguntas = async () => {
    try {
      const data = await obtenerPreguntasPorBoda(bodaId as string);
      console.log("Preguntas cargadas:", data);
      setPreguntas(data);
    } catch (error) {
      console.error("❌ Error al cargar preguntas:", error);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta pregunta?")) return;
    try {
      await eliminarPregunta(id);
      cargarPreguntas();
    } catch (error) {
      console.error("❌ Error al eliminar pregunta:", error);
    }
  };

  const handleGuardarEdicion = async (actualizada: Partial<Question>) => {
    if (!preguntaSeleccionada) return;
    try {
      await editarPregunta(preguntaSeleccionada._id, {
        ...actualizada,
        subPregunta: actualizada.subPregunta
          ? {
              ...actualizada.subPregunta,
              texto: actualizada.subPregunta.texto || "",
            }
          : undefined,
      });
      setMostrarModalEditar(false);
      cargarPreguntas();
    } catch (error) {
      console.error("❌ Error al editar pregunta:", error);
    }
  };

  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [preguntaAAsignar, setPreguntaAAsignar] = useState<Question | null>(
    null
  );

  const abrirModalAsignar = (pregunta: Question) => {
    setPreguntaAAsignar(pregunta);
    setMostrarModalAsignar(true);
  };
  const cerrarModalAsignar = () => {
    setPreguntaAAsignar(null);
    setMostrarModalAsignar(false);
  };
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📋 Preguntas de la Boda</h2>
        <button
          onClick={() => setMostrarModalCrear(true)}
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
                      🔁 Subpregunta:{<br />} {p.subPregunta.texto}
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
                  onClick={() => {
                    setPreguntaSeleccionada(p);
                    setMostrarModalEditar(true);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleEliminar(p._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  🗑️ Eliminar
                </button>
                <button
                  onClick={() => abrirModalAsignar(p)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  📤 Asignar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal Crear */}
      <CrearPreguntaModal
        isOpen={mostrarModalCrear}
        onClose={() => setMostrarModalCrear(false)}
        onPreguntaCreada={cargarPreguntas}
      />

      {/* Modal Editar */}
      {preguntaSeleccionada && (
        <EditarPreguntaModal
          isOpen={mostrarModalEditar}
          onClose={() => setMostrarModalEditar(false)}
          pregunta={preguntaSeleccionada}
          onGuardar={handleGuardarEdicion}
        />
      )}
      {/* Modal Asignar */}
      {preguntaAAsignar && (
        <AsignarPreguntaModal
          isOpen={mostrarModalAsignar}
          onClose={() => setMostrarModalAsignar(false)}
          pregunta={preguntaAAsignar}
          bodaId={bodaId as string}
          onAsignacionCompletada={() => {
            setMostrarModalAsignar(false);
            // Puedes recargar preguntas si lo necesitas
          }}
        />
      )}
    </div>
  );
}
