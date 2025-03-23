"use client";
import { useState, useEffect } from "react";
import { Formulario } from "@/interfaces/formulario";

export function useFormularios(bodaId: string, token: string) {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bodaId || !token) return;

    const fetchFormularios = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:4000/api/forms/forms/${bodaId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setFormularios(data);
        } else {
          throw new Error("Error al cargar formularios");
        }
      } catch (err) {
        setError("No se pudieron obtener los formularios.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormularios();
  }, [bodaId, token]);

  // 📌 Crear un nuevo formulario
  const crearFormulario = async (nuevoFormulario: Omit<Formulario, "_id">) => {
    try {
      const res = await fetch("http://localhost:4000/api/forms/form/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...nuevoFormulario, bodaId }),
      });

      if (!res.ok) throw new Error("Error al crear el formulario");
      const formularioCreado = await res.json();
      setFormularios([...formularios, formularioCreado]);
    } catch (err) {
      setError("No se pudo crear el formulario.");
    }
  };

  // 📌 Editar un formulario
  const editarFormulario = async (
    id: string,
    datosActualizados: Partial<Formulario>
  ) => {
    try {
      const res = await fetch(`http://localhost:4000/api/forms/form/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosActualizados),
      });

      if (!res.ok) throw new Error("Error al actualizar el formulario");
      setFormularios(
        formularios.map((form) =>
          form._id === id ? { ...form, ...datosActualizados } : form
        )
      );
    } catch (err) {
      setError("No se pudo editar el formulario.");
    }
  };

  // 📌 Eliminar un formulario
  const eliminarFormulario = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/forms/form/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar el formulario");
      setFormularios(formularios.filter((form) => form._id !== id));
    } catch (err) {
      setError("No se pudo eliminar el formulario.");
    }
  };

  return {
    formularios,
    loading,
    error,
    crearFormulario,
    editarFormulario,
    eliminarFormulario,
  };
}
