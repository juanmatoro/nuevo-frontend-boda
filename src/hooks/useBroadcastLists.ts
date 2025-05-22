"use client";
import { useState, useEffect } from "react";
import { BroadcastList, NuevaListaDifusion } from "@/interfaces/broadcast";
import axiosInstance from "@/services/axiosInstance";

export function useBroadcastLists(bodaId: string, token: string) {
  const [listas, setListas] = useState<BroadcastList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Obtener listas de difusión de la boda
  useEffect(() => {
    if (!bodaId || !token) return;

    const fetchListas = async () => {
      try {
        const response = await axiosInstance.get(`/lists`, {
          params: { bodaId },
          headers: { Authorization: `Bearer ${token}` },
        });

        setListas(Array.isArray(response.data) ? response.data : []);
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
      const response = await axiosInstance.post(
        `/lists`,
        { ...nuevaLista, bodaId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setListas((prev) => [...prev, response.data.lista]);
    } catch (err) {
      setError("No se pudo crear la lista");
    }
  };

  // 📌 Eliminar una lista de difusión
  const eliminarLista = async (listaId: string) => {
    try {
      await axiosInstance.delete(`/lists/${listaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setListas((prev) => prev.filter((lista) => lista._id !== listaId));
    } catch (err) {
      setError("No se pudo eliminar la lista");
    }
  };

  // 📌 Editar una lista de difusión
  const editarLista = async (
    listaId: string,
    datos: { nombre: string; invitados: string[] }
  ) => {
    try {
      const response = await axiosInstance.put(`/lists/${listaId}`, datos, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setListas((prev) =>
        prev.map((lista) =>
          lista._id === listaId ? response.data.lista : lista
        )
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
    eliminarLista,
    editarLista,
  };
}
