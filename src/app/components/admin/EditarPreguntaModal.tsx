"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/components/ui/Modal";
import { Question, SubPregunta } from "@/interfaces/preguntas";

interface EditarPreguntaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pregunta: Question;
  onGuardar: (updated: Partial<Question>) => void;
}

export default function EditarPreguntaModal({
  isOpen,
  onClose,
  pregunta,
  onGuardar,
}: EditarPreguntaModalProps) {
  const [textoPregunta, setTextoPregunta] = useState("");
  const [opcionesEditadas, setOpcionesEditadas] = useState<string[]>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [esObligatoria, setEsObligatoria] = useState(false);
  const [esConfirmacionAsistencia, setEsConfirmacionAsistencia] =
    useState(false);

  const [activarSubPregunta, setActivarSubPregunta] = useState(false);
  const [textoSubPregunta, setTextoSubPregunta] = useState("");
  const [opcionesSubPregunta, setOpcionesSubPregunta] = useState<string[]>([]);
  const [nuevaOpcionSub, setNuevaOpcionSub] = useState("");

  useEffect(() => {
    if (pregunta) {
      setTextoPregunta(pregunta.pregunta);
      setOpcionesEditadas(pregunta.opciones || []);
      setEsObligatoria(pregunta.esObligatoria || false);
      setEsConfirmacionAsistencia(pregunta.esConfirmacionAsistencia || false);

      if (pregunta.subPregunta) {
        setActivarSubPregunta(true);
        setTextoSubPregunta(pregunta.subPregunta.texto || "");
        setOpcionesSubPregunta(pregunta.subPregunta.opciones || []);
      } else {
        setActivarSubPregunta(false);
        setTextoSubPregunta("");
        setOpcionesSubPregunta([]);
      }
    }
  }, [pregunta]);

  const agregarOpcion = () => {
    if (nuevaOpcion.trim()) {
      setOpcionesEditadas([...opcionesEditadas, nuevaOpcion.trim()]);
      setNuevaOpcion("");
    }
  };

  const agregarOpcionSub = () => {
    if (nuevaOpcionSub.trim()) {
      setOpcionesSubPregunta([...opcionesSubPregunta, nuevaOpcionSub.trim()]);
      setNuevaOpcionSub("");
    }
  };

  const guardarCambios = () => {
    const subPregunta: SubPregunta | null = activarSubPregunta
      ? {
          pregunta: textoSubPregunta,
          opciones: opcionesSubPregunta,
          texto: "", // Provide a default or meaningful value for 'texto'
        }
      : null;

    onGuardar({
      pregunta: textoPregunta,
      opciones: opcionesEditadas,
      esObligatoria,
      esConfirmacionAsistencia,
      subPregunta,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Editar Pregunta">
      <div className="space-y-4">
        <input
          type="text"
          value={textoPregunta}
          onChange={(e) => setTextoPregunta(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Texto de la pregunta"
        />

        {/* Editar opciones */}
        <div>
          <label className="block font-medium mb-1">Opciones:</label>
          {opcionesEditadas.map((op, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={op}
                onChange={(e) => {
                  const nuevas = [...opcionesEditadas];
                  nuevas[idx] = e.target.value;
                  setOpcionesEditadas(nuevas);
                }}
                className="flex-grow border p-2 rounded"
              />
              <button
                onClick={() =>
                  setOpcionesEditadas(
                    opcionesEditadas.filter((_, i) => i !== idx)
                  )
                }
                className="text-red-500 hover:text-red-700"
              >
                ❌
              </button>
            </div>
          ))}
          <div className="flex space-x-2 mt-2">
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
        </div>

        {/* Flags */}
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
          <span>¿Tiene subpregunta condicional?</span>
        </label>

        {activarSubPregunta && (
          <div className="bg-gray-50 p-4 rounded border space-y-2">
            <input
              type="text"
              value={textoSubPregunta}
              onChange={(e) => setTextoSubPregunta(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Texto de la subpregunta"
            />

            {opcionesSubPregunta.map((op, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-1">
                <input
                  type="text"
                  value={op}
                  onChange={(e) => {
                    const nuevas = [...opcionesSubPregunta];
                    nuevas[idx] = e.target.value;
                    setOpcionesSubPregunta(nuevas);
                  }}
                  className="flex-grow border p-2 rounded"
                />
                <button
                  onClick={() =>
                    setOpcionesSubPregunta(
                      opcionesSubPregunta.filter((_, i) => i !== idx)
                    )
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            ))}

            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                value={nuevaOpcionSub}
                onChange={(e) => setNuevaOpcionSub(e.target.value)}
                className="flex-grow border p-2 rounded"
                placeholder="Nueva opción"
              />
              <button
                type="button"
                onClick={agregarOpcionSub}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                ➕ Añadir
              </button>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded border-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={guardarCambios}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            💾 Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
}
