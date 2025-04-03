import Modal from "@/app/components/ui/Modal";
import { useEffect, useState } from "react";
import axios from "@/services/axiosInstance";
import { updateInvitado } from "@/services/invitadosSercice";

interface Invitado {
  _id: string;
  nombre: string;
  telefono: string;
  invitadoDe: string;
  confirmacion: boolean | null;
  bodaId: string;
}

interface EditarInvitadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitado: Invitado;
  onSave?: (updated: Invitado) => void; // Add onSave to the props
}

export default function EditarInvitadoModal({
  isOpen,
  onClose,
  invitado,
  onSave,
}: EditarInvitadoModalProps) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [invitadoDe, setInvitadoDe] = useState("novio");
  const [confirmacion, setConfirmacion] = useState<"si" | "no" | "pendiente">(
    "pendiente"
  );

  useEffect(() => {
    if (invitado) {
      setNombre(invitado.nombre || "");
      setTelefono(invitado.telefono || "");
      setInvitadoDe(invitado.invitadoDe || "novio");
      if (invitado.confirmacion === true) setConfirmacion("si");
      else if (invitado.confirmacion === false) setConfirmacion("no");
      else setConfirmacion("pendiente");
    }
  }, [invitado]);

  const handleGuardar = async () => {
    try {
      const confirmacionValor =
        confirmacion === "si" ? true : confirmacion === "no" ? false : null;
  
      // ✅ Usar el servicio
      await updateInvitado(invitado._id, {
        nombre,
        telefono,
        invitadoDe,
        confirmacion: confirmacionValor,
      });
  
      onClose();
      if (onSave) onSave({
        ...invitado,
        nombre,
        telefono,
        invitadoDe,
        confirmacion: confirmacionValor,
      });
    } catch (error) {
      console.error("❌ Error al actualizar invitado:", error);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Editar invitado">
      <div className="space-y-4">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Nombre del invitado"
        />

        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Teléfono"
        />

        <select
          value={invitadoDe}
          onChange={(e) => setInvitadoDe(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="novio">👱‍♂️ Invitado del Novio</option>
          <option value="novia">👰 Invitado de la Novia</option>
        </select>

        <select
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value as any)}
          className="w-full border p-2 rounded"
        >
          <option value="pendiente">❔ Pendiente</option>
          <option value="si">✅ Confirmado</option>
          <option value="no">❌ Rechazado</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            💾 Guardar cambios
          </button>
        </div>
      </div>
    </Modal>
  );
}
