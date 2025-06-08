// // En tu archivo PreguntasInvitado.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { guardarRespuestasInvitado } from "@/services/invitadosSercice"; // Usaremos una función específica para "mis" respuestas
// import { Question } from "@/interfaces/preguntas"; // Asumiendo que esta interfaz es correcta

// // El componente ahora recibe props de su padre
// interface PreguntasInvitadoProps {
//   preguntas: Question[]; // Array de preguntas asignadas
//   invitadoId: string; // El ID del invitado
//   // Función para notificar al padre que los datos se actualizaron
//   onRespuestasGuardadas: (invitadoActualizado: any) => void;
// }

// export default function PreguntasInvitado({
//   preguntas,
//   invitadoId,
//   onRespuestasGuardadas,
// }: PreguntasInvitadoProps) {
//   const [respuestas, setRespuestas] = useState<Record<string, string>>({});
//   const [respuestasOriginales, setRespuestasOriginales] = useState<
//     Record<string, string>
//   >({});
//   const [guardado, setGuardado] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   // useEffect para inicializar el estado de las respuestas cuando las props cambian
//   useEffect(() => {
//     // Si no hay preguntas, no hagas nada
//     if (!Array.isArray(preguntas)) return;

//     const respsIniciales: Record<string, string> = {};
//     preguntas.forEach((p) => {
//       // Inicializar respuesta principal
//       respsIniciales[p._id] = p.respuesta || "";
//       // Inicializar sub-respuesta si existe
//       if (p.subPregunta) {
//         respsIniciales[`${p._id}_sub`] = p.subRespuesta || "";
//       }
//     });

//     setRespuestas(respsIniciales);
//     setRespuestasOriginales(respsIniciales);
//   }, [preguntas]); // Se ejecuta cada vez que el array de preguntas cambie

//   const handleChange = (preguntaId: string, valor: string) => {
//     setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
//     setGuardado(false); // Resetea el estado de guardado si hay cambios
//   };

//   const handleChangeSub = (preguntaId: string, valor: string) => {
//     setRespuestas((prev) => ({ ...prev, [`${p._id}_sub`]: valor }));
//     setGuardado(false);
//   };

//   // Compara si hay cambios respecto a las respuestas originales
//   const hayCambios =
//     JSON.stringify(respuestas) !== JSON.stringify(respuestasOriginales);

//   const validarRespuestasObligatorias = () => {
//     // Si 'preguntas' no es un array, no se puede validar
//     if (!Array.isArray(preguntas)) return false;

//     for (const pregunta of preguntas) {
//       if (pregunta.esObligatoria && !respuestas[pregunta._id]) {
//         alert(
//           `Por favor, responde la pregunta obligatoria: "${pregunta.pregunta}"`
//         );
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleGuardar = async () => {
//     if (!validarRespuestasObligatorias()) {
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const nuevasRespuestas = preguntas.map((p) => {
//         const respuestaPrincipal = respuestas[p._id] || "";
//         const subRespuesta = respuestas[`${p._id}_sub`] || "";

//         return {
//           preguntaId: p._id,
//           respuesta: respuestaPrincipal,
//           // Solo incluye subRespuesta si tiene un valor
//           ...(subRespuesta && { subRespuesta: subRespuesta }),
//         };
//       });

//       console.log("🟢 Enviando estas respuestas al backend:", nuevasRespuestas);

//       // Llama a la nueva función de servicio que usa el endpoint /me/answers
//       // Esta función no necesita el ID del invitado porque el backend lo sabe por el token JWT
//       const invitadoActualizado = await guardarRespuestasInvitado(
//         nuevasRespuestas
//       );

//       setGuardado(true);
//       // Actualiza los estados para reflejar que no hay cambios pendientes
//       setRespuestasOriginales(respuestas);
//       // Notifica al componente padre sobre la actualización para que pueda refrescar su estado
//       onRespuestasGuardadas(invitadoActualizado);

//       // Oculta el mensaje de "guardado" después de unos segundos
//       setTimeout(() => setGuardado(false), 3000);
//     } catch (error) {
//       console.error("❌ Error al guardar respuestas:", error);
//       setError("Hubo un error al guardar tus respuestas. Inténtalo de nuevo.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Guardia de seguridad principal: si 'preguntas' no es un array, muestra un mensaje.
//   if (!Array.isArray(preguntas)) {
//     return <p className="text-gray-500">Cargando preguntas...</p>;
//   }

//   return (
//     <div className="space-y-6">
//       {/* El título se puede mover aquí o dejarlo en el componente padre */}

//       {preguntas.map((p) => {
//         // Comprobación de seguridad para 'p.opciones'
//         if (!Array.isArray(p.opciones)) return null;

//         const respuestaActual = respuestas[p._id] || "";
//         const mostrarSub =
//           p.subPregunta && respuestaActual.toLowerCase().startsWith("si");

//         return (
//           <div key={p._id} className="border rounded p-4 space-y-3">
//             <label className="block font-semibold">
//               {p.pregunta}
//               {p.esObligatoria && <span className="text-red-500 ml-1">*</span>}
//             </label>

//             <select
//               value={respuestaActual}
//               onChange={(e) => handleChange(p._id, e.target.value)}
//               className="w-full border p-2 rounded"
//             >
//               <option value="">Selecciona una opción</option>
//               {p.opciones.map((op, i) => (
//                 <option key={i} value={op}>
//                   {op}
//                 </option>
//               ))}
//             </select>

//             {mostrarSub && p.subPregunta && (
//               <div className="mt-2 pl-4 border-l-2 border-gray-300">
//                 <label className="block font-medium">
//                   {p.subPregunta.pregunta}
//                 </label>
//                 {/* Comprobación de seguridad para p.subPregunta.opciones */}
//                 <select
//                   value={respuestas[`${p._id}_sub`] || ""}
//                   onChange={(e) => handleChangeSub(p._id, e.target.value)}
//                   className="w-full border p-2 rounded"
//                 >
//                   <option value="">Selecciona una opción</option>
//                   {Array.isArray(p.subPregunta.opciones) &&
//                     p.subPregunta.opciones.map((op, i) => (
//                       <option key={i} value={op}>
//                         {op}
//                       </option>
//                     ))}
//                 </select>
//               </div>
//             )}
//           </div>
//         );
//       })}

//       <button
//         onClick={handleGuardar}
//         disabled={!hayCambios || loading}
//         className={`px-4 py-2 rounded text-white transition-colors ${
//           !hayCambios || loading
//             ? "bg-gray-400 cursor-not-allowed"
//             : "bg-blue-600 hover:bg-blue-700"
//         }`}
//       >
//         {loading ? "💾 Guardando..." : "💾 Guardar respuestas"}
//       </button>

//       {guardado && (
//         <p className="text-green-600 font-medium">
//           ✅ ¡Respuestas guardadas correctamente!
//         </p>
//       )}
//       {error && <p className="text-red-500 font-medium">{error}</p>}
//     </div>
//   );
// }

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
