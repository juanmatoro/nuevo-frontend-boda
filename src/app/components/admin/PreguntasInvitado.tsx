"use client";

import { useEffect, useState } from "react";
import {
  getInvitadoById,
  updateInvitado,
  guardarRespuestasInvitado,
} from "@/services/invitadosSercice";
import { Question } from "@/interfaces/preguntas";
import { Invitado } from "@/interfaces/invitado";
import { useParams } from "next/navigation";

export default function PreguntasInvitado() {
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [respuestasOriginales, setRespuestasOriginales] = useState<
    Record<string, string>
  >({});
  const [preguntas, setPreguntas] = useState<Question[]>([]);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchInvitado = async () => {
      try {
        const data = (await getInvitadoById(id)) as Invitado;
        setInvitado(data);

        const resps: Record<string, string> = {};
        (data.respuestas ?? []).forEach((r) => {
          resps[r.preguntaId] = r.respuesta || "";
        });
        setRespuestas(resps);
        setRespuestasOriginales(resps);
        setPreguntas(data.preguntasAsignadas || []);
      } catch (error) {
        console.error("❌ Error al cargar invitado:", error);
      }
    };

    fetchInvitado();
  }, [id]);

  const handleChange = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    setGuardado(false);
  };

  const handleChangeSub = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [`${preguntaId}_sub`]: valor }));
    setGuardado(false);
  };

  const hayCambios = Object.keys(respuestas).some(
    (pid) => respuestas[pid] !== respuestasOriginales[pid]
  );

  const validarRespuestasObligatorias = () => {
    for (const pregunta of preguntas) {
      if (pregunta.esObligatoria && !respuestas[pregunta._id]) {
        return false;
      }
    }
    return true;
  };
  const handleGuardar = async () => {
    if (!invitado) return;

    if (!validarRespuestasObligatorias()) {
      alert("Por favor, responde todas las preguntas obligatorias.");
      return;
    }

    try {
      const nuevasRespuestas = preguntas.map((p) => {
        const respuestaPrincipal = respuestas[p._id] || "";
        const subKey = `${p._id}_sub`;
        const subRespuesta = respuestas[subKey] || "";

        return {
          preguntaId: p._id,
          pregunta: p.pregunta,
          respuesta: respuestaPrincipal,
          subRespuesta: subRespuesta || undefined, // Solo se envía si existe
        };
      });

      console.log("🟢 Enviando estas respuestas al backend:", nuevasRespuestas);

      const updated: Invitado = await guardarRespuestasInvitado(
        invitado._id,
        nuevasRespuestas
      );

      setInvitado(updated);
      setRespuestasOriginales(respuestas);
      setGuardado(true);
    } catch (error) {
      console.error("❌ Error al guardar respuestas:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📝 Responde tus preguntas</h2>

      {preguntas.map((p) => {
        const respuestaActual = respuestas[p._id] || "";

        const mostrarSub =
          p.subPregunta &&
          typeof respuestaActual === "string" &&
          respuestaActual.toLowerCase().startsWith("si");

        return (
          <div key={p._id} className="border rounded p-4 space-y-3">
            <label className="block font-semibold">
              {p.pregunta}
              {p.esObligatoria && <span className="text-red-500 ml-1">*</span>}
            </label>

            <select
              value={respuestaActual}
              onChange={(e) => handleChange(p._id, e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Selecciona una opción</option>
              {p.opciones.map((op, i) => (
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
                  value={respuestas[`${p._id}_sub`] || ""}
                  onChange={(e) => handleChangeSub(p._id, e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Selecciona una opción</option>
                  {p.subPregunta.opciones.map((op, i) => (
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
        onClick={handleGuardar}
        disabled={!hayCambios}
        className={`px-4 py-2 rounded text-white ${
          hayCambios
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        💾 Guardar respuestas
      </button>

      {guardado && (
        <p className="text-green-600 font-medium">✅ Respuestas guardadas</p>
      )}
    </div>
  );
}
