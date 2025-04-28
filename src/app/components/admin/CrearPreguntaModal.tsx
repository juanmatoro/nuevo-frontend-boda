"use client";

import { useState } from "react";
import Modal from "@/app/components/ui/Modal";
import { crearPregunta } from "@/services/preguntasService";
import {
  Question,
  SubPregunta,
  CrearPreguntaPayload,
  CrearPreguntaModalProps,
} from "@/interfaces/preguntas";

export default function CrearPreguntaModal({
  isOpen,
  onClose,
  onPreguntaCreada,
}: CrearPreguntaModalProps) {
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState<string[]>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [esObligatoria, setEsObligatoria] = useState(false);
  const [esConfirmacionAsistencia, setEsConfirmacionAsistencia] =
    useState(false);

  // Subpregunta
  const [activarSubPregunta, setActivarSubPregunta] = useState(false);
  const [textoSubPregunta, setTextoSubPregunta] = useState("");
  const [opcionesSubPregunta, setOpcionesSubPregunta] = useState<string[]>([]);
  const [nuevaOpcionSub, setNuevaOpcionSub] = useState("");

  const handleAgregarOpcion = () => {
    if (nuevaOpcion.trim()) {
      setOpciones([...opciones, nuevaOpcion.trim()]);
      setNuevaOpcion("");
    }
  };

  const handleAgregarOpcionSub = () => {
    if (nuevaOpcionSub.trim()) {
      setOpcionesSubPregunta([...opcionesSubPregunta, nuevaOpcionSub.trim()]);
      setNuevaOpcionSub("");
    }
  };

  const handleGuardar = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const user = JSON.parse(storedUser);
    const bodaId = user.bodaId;

    if (!bodaId || opciones.length < 2) {
      alert("Debe completar la pregunta con al menos 2 opciones.");
      return;
    }

    try {
      await crearPregunta({
        bodaId,
        pregunta,
        opciones,
        esObligatoria,
        esConfirmacionAsistencia,
        subPregunta: activarSubPregunta
          ? {
              texto: textoSubPregunta,
              opciones: opcionesSubPregunta,
            }
          : null,
      });

      // Reset
      setPregunta("");
      setOpciones([]);
      setNuevaOpcion("");
      setEsObligatoria(false);
      setEsConfirmacionAsistencia(false);
      setActivarSubPregunta(false);
      setTextoSubPregunta("");
      setOpcionesSubPregunta([]);
      setNuevaOpcionSub("");

      onClose();
      onPreguntaCreada();
    } catch (error) {
      console.error("❌ Error al crear la pregunta:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Crear Nueva Pregunta">
      <div className="space-y-4">
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Escribe la pregunta principal"
          className="w-full border p-2 rounded"
        />

        {/* Opciones */}
        <div>
          <label className="block mb-1 font-medium">Opciones:</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={nuevaOpcion}
              onChange={(e) => setNuevaOpcion(e.target.value)}
              placeholder="Nueva opción"
              className="flex-grow border p-2 rounded"
            />
            <button
              type="button"
              onClick={handleAgregarOpcion}
              className="bg-gray-700 text-white px-3 py-1 rounded"
            >
              ➕ Añadir
            </button>
          </div>
          <ul className="list-disc ml-5 text-sm text-gray-600">
            {opciones.map((op, i) => (
              <li key={i}>{op}</li>
            ))}
          </ul>
        </div>

        {/* Configuración */}
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

        {/* Subpregunta */}
        <label className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            checked={activarSubPregunta}
            onChange={(e) => setActivarSubPregunta(e.target.checked)}
          />
          <span>¿Añadir subpregunta condicional?</span>
        </label>

        {activarSubPregunta && (
          <div className="border rounded p-4 space-y-2 bg-gray-50">
            <input
              type="text"
              value={textoSubPregunta}
              onChange={(e) => setTextoSubPregunta(e.target.value)}
              placeholder="Texto de la subpregunta"
              className="w-full border p-2 rounded"
            />

            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={nuevaOpcionSub}
                onChange={(e) => setNuevaOpcionSub(e.target.value)}
                placeholder="Nueva opción subpregunta"
                className="flex-grow border p-2 rounded"
              />
              <button
                type="button"
                onClick={handleAgregarOpcionSub}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                ➕ Añadir
              </button>
            </div>
            <ul className="list-disc ml-5 text-sm text-gray-600">
              {opcionesSubPregunta.map((op, i) => (
                <li key={i}>{op}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            ✅ Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
}
