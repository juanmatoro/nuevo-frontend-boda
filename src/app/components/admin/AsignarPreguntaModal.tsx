// src/app/components/modales/AsignarPreguntaModal.tsx
"use client";

import { useState, useEffect } from "react";
import Modal from "@/app/components/ui/Modal";
import {
  getInvitadosByBoda,
  asignarPreguntaAInvitados,
} from "@/services/invitadosSercice";
import {
  getListasPorInvitado,
  getBroadcastListsByBoda,
} from "@/services/broadcastService";
import { BroadcastList } from "@/interfaces/broadcast";
import { Invitado } from "@/interfaces/invitado";
import { Question } from "@/interfaces/preguntas";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pregunta: Question;
  bodaId: string;
  onAsignacionCompletada: () => void;
}

export default function AsignarPreguntaModal({
  isOpen,
  onClose,
  pregunta,
  bodaId,
  onAsignacionCompletada,
}: Props) {
  const [tipo, setTipo] = useState<"todos" | "lista" | "invitado">("todos");
  const [listas, setListas] = useState<BroadcastList[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [listaSeleccionada, setListaSeleccionada] = useState<string>("");
  const [invitadoSeleccionado, setInvitadoSeleccionado] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (tipo === "lista") cargarListas();
    if (tipo === "invitado") cargarInvitados();
  }, [tipo]);

  const cargarListas = async () => {
    try {
      const data = await getBroadcastListsByBoda(bodaId);
      setListas(data);
    } catch (err) {
      console.error("❌ Error al cargar listas:", err);
    }
  };

  const cargarInvitados = async () => {
    try {
      const { invitados } = (await getInvitadosByBoda(bodaId)) as {
        invitados: Invitado[];
      };
      setInvitados(invitados);
    } catch (err) {
      console.error("❌ Error al cargar invitados:", err);
    }
  };

  const handleGuardar = async () => {
    try {
      let payload: any = {
        preguntaId: pregunta._id,
        tipoAsignacion: tipo,
      };

      if (tipo === "lista") {
        if (!listaSeleccionada) return setError("Debes seleccionar una lista.");
        payload.listaId = listaSeleccionada;
      }

      if (tipo === "invitado") {
        if (!invitadoSeleccionado)
          return setError("Debes seleccionar un invitado.");
        payload.invitadoId = invitadoSeleccionado;
      }

      await asignarPreguntaAInvitados(payload);
      onAsignacionCompletada();
      handleReset();
    } catch (err) {
      console.error("❌ Error al asignar pregunta:", err);
      setError("No se pudo asignar la pregunta.");
    }
  };

  const handleReset = () => {
    setTipo("todos");
    setListaSeleccionada("");
    setInvitadoSeleccionado("");
    setError("");
    onClose();
  };
  // Para depurar
  console.log("📤 Tipo de asignación:", tipo);
  console.log("📥 Listas disponibles:", listas);
  console.log("📥 Invitados disponibles:", invitados);
  console.log("📥 Lista seleccionada:", listaSeleccionada);
  console.log("📥 Datos de la pregunta:", pregunta._id, pregunta.pregunta);
  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="📤 Asignar Pregunta">
      <div className="space-y-4">
        <p className="font-medium">{pregunta.pregunta}</p>

        <div className="space-y-2">
          <label className="block font-semibold">
            ¿A quién deseas asignarla?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="todos"
                checked={tipo === "todos"}
                onChange={() => setTipo("todos")}
              />
              <span>Todos los invitados</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="lista"
                checked={tipo === "lista"}
                onChange={() => setTipo("lista")}
              />
              <span>Por lista</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="invitado"
                checked={tipo === "invitado"}
                onChange={() => setTipo("invitado")}
              />
              <span>Invitado concreto</span>
            </label>
          </div>
        </div>

        {tipo === "lista" && (
          <select
            className="w-full border p-2 rounded"
            value={listaSeleccionada}
            onChange={(e) => setListaSeleccionada(e.target.value)}
          >
            <option value="">Selecciona una lista</option>
            {listas.map((l) => (
              <option key={l._id} value={l._id}>
                {l.nombre}
              </option>
            ))}
          </select>
        )}

        {tipo === "invitado" && (
          <select
            className="w-full border p-2 rounded"
            value={invitadoSeleccionado}
            onChange={(e) => setInvitadoSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un invitado</option>
            {invitados.map((i) => (
              <option key={i._id} value={i._id}>
                {i.nombre} ({i.telefono})
              </option>
            ))}
          </select>
        )}

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 border rounded border-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            📤 Asignar
          </button>
        </div>
      </div>
    </Modal>
  );
}
