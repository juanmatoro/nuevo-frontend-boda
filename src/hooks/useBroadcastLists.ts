"use client";
import { useState, useEffect } from "react";
import { BroadcastList, NuevaListaDifusion } from "@/interfaces/broadcast";

export function useBroadcastLists(bodaId: string, token: string) {
  const [listas, setListas] = useState<BroadcastList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Obtener listas de difusión de la boda
  useEffect(() => {
    if (!bodaId || !token) return;

    const fetchListas = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/lists?bodaId=${bodaId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok)
          throw new Error("Error al obtener listas de difusión");

        const data = await response.json();
        setListas(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("No se pudieron cargar las listas");
      } finally {
        setLoading(false);
      }
    };

    fetchListas();
  }, [bodaId, token]);

  // 📌 Crear una nueva lista de difusión
  const crearLista = async (nuevaLista: NuevaListaDifusion) => {
    try {
      const response = await fetch("http://localhost:4000/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...nuevaLista,
          bodaId,
        }),
      });

      if (!response.ok) throw new Error("Error al crear la lista de difusión");

      const listaCreada = await response.json();
      setListas((prev) => [...prev, listaCreada.lista]); // Actualizar la UI
    } catch (err) {
      setError("No se pudo crear la lista");
    }
  };

  // 📌 **Eliminar una lista de difusión**
  const eliminarLista = async (listaId: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/lists/${listaId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Error al eliminar la lista");

      setListas((prev) => prev.filter((lista) => lista._id !== listaId)); // Actualizar la UI tras eliminar
    } catch (err) {
      setError("No se pudo eliminar la lista");
    }
  };

  const editarLista = async (
    listaId: string,
    datos: { nombre: string; invitados: string[] }
  ) => {
    try {
      if (!token || !bodaId) {
        console.error("❌ Error: Token o bodaId no disponible.");
        return;
      }

      const response = await fetch(
        `http://localhost:4000/api/lists/${listaId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datos),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error en la respuesta del servidor:", errorText);
        throw new Error("Error al editar la lista");
      }

      const updatedList = await response.json();
      setListas((prev) =>
        prev.map((lista) => (lista._id === listaId ? updatedList.lista : lista))
      );
    } catch (err) {
      console.error("❌ Error en editarLista:", err);
      setError("No se pudo editar la lista");
    }
  };

  return {
    listas,
    loading,
    error,
    crearLista,
    eliminarLista, // ⬅️ Ahora este método está disponible para usar en el frontend
    editarLista,
  };
}
