"use client";

import { useState, useEffect } from "react";
import { useBroadcastLists } from "@/hooks/useBroadcastLists";
import { Invitado, BroadcastList } from "@/interfaces/broadcast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";

// 📌 Esquema de validación con Zod
const listaDifusionSchema = z.object({
  nombre: z.string().min(3, "El nombre es obligatorio"),
  invitados: z.array(z.string()).min(1, "Debes seleccionar al menos un invitado"),
});

type ListaDifusionForm = z.infer<typeof listaDifusionSchema>;

export default function ListasDifusionDashboard() {
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [bodaId, setBodaId] = useState<string | null>(null);
  const { listas = [], loading, error, crearLista, eliminarLista, editarLista } = useBroadcastLists(bodaId || "", token || "");
  const [editandoLista, setEditandoLista] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, getValues } = useForm<ListaDifusionForm>({
    resolver: zodResolver(listaDifusionSchema),
    defaultValues: { nombre: "", invitados: [] },
  });

  // 📌 Obtener invitados al cargar la página
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userToken = localStorage.getItem("token");

    if (userToken && user.bodaId) {
      setToken(userToken);
      setBodaId(user.bodaId);

      fetch(`http://localhost:4000/api/guests/invitados/${user.bodaId}?limit=1000`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.invitados)) {
            setInvitados(data.invitados);
          } else {
            console.error("❌ API no devolvió un array de invitados:", data);
            setInvitados([]);
          }
        })
        .catch((err) => {
          console.error("❌ Error al obtener invitados:", err);
          setInvitados([]);
        });
    }
  }, []);

  // 📌 Enviar formulario de nueva lista
  const onSubmit = async (data: ListaDifusionForm) => {
    if (!bodaId || !token) {
      console.error("❌ No hay bodaId o token disponible");
      return;
    }

    try {
      await crearLista(data);
      reset(); // ✅ Limpiar formulario tras crear la lista (incluye invitados)
    } catch (error) {
      console.error("❌ Error al crear lista:", error);
    }
  };

  // 📌 Función para abrir la edición de una lista
  const abrirEdicion = (lista: BroadcastList) => {
    setEditandoLista(lista._id);
    setValue("nombre", lista.nombre);
    setValue("invitados", lista.invitados.map((i: Invitado) => i._id));
  };

  // 📌 Función para guardar los cambios de una lista editada
  const guardarEdicion = async () => {
    if (!editandoLista) return;

    try {
      const data = getValues();
      await editarLista(editandoLista, { nombre: data.nombre, invitados: data.invitados });
      setEditandoLista(null);
      reset(); // ✅ Limpiar los campos después de guardar los cambios
    } catch (error) {
      console.error("❌ Error al editar la lista:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📢 Gestionar Listas de Difusión</h2>

      {/* ✅ Formulario para crear nueva lista */}
      <form onSubmit={handleSubmit(onSubmit)} className="border p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <label className="block font-semibold mb-2">📌 Nombre de la lista:</label>
          <Controller
            name="nombre"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className="w-full p-2 border rounded"
                placeholder="Ej: Amigos Cercanos"
              />
            )}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">🎉 Selecciona invitados:</label>
          <Controller
            name="invitados"
            control={control}
            render={({ field }) => (
              <Select
                options={invitados.map((i) => ({ value: i._id, label: `${i.nombre} (${i.telefono})` }))}
                isMulti
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selected) => field.onChange(selected.map((s) => s.value))}
              />
            )}
          />
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          ✅ Crear Lista
        </button>
      </form>

      {/* 📌 Mostrar Listas de Difusión */}
      <h3 className="text-xl font-semibold mt-6 mb-2">📜 Listas Creadas:</h3>
      {loading ? (
        <p className="text-gray-600">Cargando listas...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : listas.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {listas.map((lista) => (
            <li key={lista._id} className="border p-4 rounded-lg flex justify-between">
              {editandoLista === lista._id ? (
                // 📌 Formulario de edición
                <div className="w-full">
                  <Controller
                    name="nombre"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className="w-full p-2 border rounded mb-2"
                      />
                    )}
                  />
                  <Controller
                    name="invitados"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={invitados.map((i) => ({
                          value: i._id,
                          label: `${i.nombre} (${i.telefono})`,
                        }))}
                        isMulti
                        value={invitados
                          .filter((i) => field.value.includes(i._id))
                          .map((i) => ({ value: i._id, label: `${i.nombre} (${i.telefono})` }))}
                        onChange={(selected) =>
                          field.onChange(selected.map((s) => s.value))
                        }
                        className="mb-2"
                      />
                    )}
                  />
                  <button onClick={guardarEdicion} className="bg-blue-500 text-white px-4 py-2 rounded">
                    💾 Guardar
                  </button>
                  <button onClick={() => setEditandoLista(null)} className="ml-2 text-gray-500">
                    ❌ Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-bold">{lista.nombre}</p>
                    <p className="text-sm text-gray-500">{lista.invitados.length} Invitados</p>
                  </div>
                  <div>
                    <button onClick={() => abrirEdicion(lista)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                      ✏️ Editar
                    </button>
                    <button onClick={() => eliminarLista(lista._id)} className="bg-red-500 text-white px-3 py-1 rounded ml-2">
                      🗑️ Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No hay listas creadas aún.</p>
      )}
    </div>
  );
}
