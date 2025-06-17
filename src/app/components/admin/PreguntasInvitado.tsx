// src/app/components/admin/PreguntasInvitado.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { Question } from "@/interfaces/preguntas";

// El componente ahora recibe sus datos y funciones a través de props
interface PreguntasInvitadoProps {
  preguntas: Question[];
  mode: "view" | "edit"; // El padre decide el modo
  onSave: (respuestasParaEnviar: any[]) => Promise<void>;
}

export default function PreguntasInvitado({
  preguntas,
  mode,
  onSave,
}: PreguntasInvitadoProps) {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [respuestasOriginales, setRespuestasOriginales] = useState<
    Record<string, string>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inicializa el estado del formulario con las preguntas que vienen del padre
  useEffect(() => {
    if (!Array.isArray(preguntas)) return;
    const respsIniciales: Record<string, string> = {};
    preguntas.forEach((p) => {
      // ▼▼▼ CORRECCIÓN: Usamos consistentemente 'preguntaId' como clave ▼▼▼
      const keyId = p.preguntaId || p._id; // Usar preguntaId, con fallback a _id por si acaso
      if (keyId) {
        respsIniciales[keyId] = p.respuesta || "";
        if (p.subPregunta) {
          respsIniciales[`${keyId}_sub`] = p.subRespuesta || "";
        }
      }
    });
    setRespuestas(respsIniciales);
    setRespuestasOriginales(respsIniciales);
  }, [preguntas]);

  const handleChange = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    setSaveSuccess(false);
  };

  const handleChangeSub = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [`${preguntaId}_sub`]: valor }));
    setSaveSuccess(false);
  };

  const hayCambios =
    JSON.stringify(respuestas) !== JSON.stringify(respuestasOriginales);

  const handleGuardar = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const nuevasRespuestasParaEnviar = preguntas.map((p) => {
      const keyId = p.preguntaId || p._id;
      return {
        preguntaId: keyId,
        respuesta: respuestas[keyId] || "",
        subRespuesta: respuestas[`${keyId}_sub`] || undefined,
      };
    });

    try {
      await onSave(nuevasRespuestasParaEnviar);
      setSaveSuccess(true);
      setRespuestasOriginales(respuestas);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      // El toast de error ya lo maneja el padre
    } finally {
      setIsSaving(false);
    }
  };

  if (!Array.isArray(preguntas) || preguntas.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No hay preguntas asignadas para responder.
      </p>
    );
  }

  // --- MODO DE SOLO LECTURA (PARA NOVIOS/ADMIN) ---
  if (mode === "view") {
    return (
      <ul className="space-y-4">
        {preguntas.map((p) => (
          <li key={p.preguntaId || p._id} className="border-t pt-3">
            <p className="font-semibold">{p.pregunta}</p>
            <p className="text-gray-700 pl-2 mt-1">
              <strong>Respuesta:</strong>{" "}
              {p.respuesta ? (
                p.respuesta
              ) : (
                <span className="italic text-gray-400">Sin responder</span>
              )}
            </p>
            {p.subRespuesta && (
              <p className="text-gray-600 pl-4 text-sm">
                <strong>Detalle:</strong> {p.subRespuesta}
              </p>
            )}
          </li>
        ))}
      </ul>
    );
  }

  // --- MODO DE EDICIÓN (PARA EL INVITADO O NOVIO) ---
  return (
    <form onSubmit={handleGuardar} className="space-y-6">
      {preguntas.map((p) => {
        if (!p) return null;
        // ▼▼▼ CORRECCIÓN: Usamos consistentemente 'preguntaId' como clave ▼▼▼
        const keyId = p.preguntaId || p._id;
        const respuestaActual = respuestas[keyId] || "";
        const mostrarSub =
          p.subPregunta && respuestaActual?.toLowerCase().startsWith("si");

        return (
          <div key={keyId} className="border rounded p-4 space-y-3">
            <label className="block font-semibold">
              {p.pregunta}
              {p.esObligatoria && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={respuestaActual}
              onChange={(e) => handleChange(keyId, e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Selecciona una opción</option>
              {Array.isArray(p.opciones) &&
                p.opciones.map((op, i) => (
                  <option key={i} value={op}>
                    {op}
                  </option>
                ))}
            </select>
            {mostrarSub && p.subPregunta && (
              <div className="mt-2 pl-4 border-l-2 border-gray-300">
                <label className="block font-medium">
                  {p.subPregunta.texto || p.subPregunta.pregunta}
                </label>
                <select
                  value={respuestas[`${keyId}_sub`] || ""}
                  onChange={(e) => handleChangeSub(keyId, e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Selecciona una opción</option>
                  {Array.isArray(p.subPregunta.opciones) &&
                    p.subPregunta.opciones.map((op, i) => (
                      <option key={i} value={op}>
                        {op}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        );
      })}
      <button
        type="submit"
        disabled={!hayCambios || isSaving}
        className={`px-4 py-2 rounded text-white font-medium transition-colors ${
          !hayCambios || isSaving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSaving ? "Guardando..." : "💾 Guardar Respuestas"}
      </button>
      {saveSuccess && (
        <p className="text-green-600 font-medium">✅ ¡Respuestas guardadas!</p>
      )}
    </form>
  );
}
