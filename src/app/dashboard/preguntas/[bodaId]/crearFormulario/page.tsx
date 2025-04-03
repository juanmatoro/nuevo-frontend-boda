"use client";

import { useEffect, useState } from "react";
import { useFormularios } from "@/archivado/hooks/useFormularios";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import { Formulario } from "@/interfaces/formulario";
import ClientOnly from "@/app/components/common/ClientOnly";
import Modal from "@/app/components/ui/Modal";

// 📌 Esquema de validación con Zod
const formularioSchema = z.object({
  nombre: z.string().min(3, "El nombre es obligatorio"),
  preguntas: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos una pregunta"),
  enviadosA: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos un destinatario"),
});

type FormularioData = z.infer<typeof formularioSchema>;

export default function FormulariosDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [bodaId, setBodaId] = useState<string | null>(null);
  const [invitados, setInvitados] = useState<
    { _id: string; nombre: string; telefono: string }[]
  >([]);
  const [preguntas, setPreguntas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formularioEditando, setFormularioEditando] =
    useState<Formulario | null>(null);

  const {
    formularios,
    loading,
    error,
    crearFormulario,
    eliminarFormulario,
    editarFormulario,
  } = useFormularios(bodaId || "", token || "");

  const { control, handleSubmit, reset, setValue } = useForm<FormularioData>({
    resolver: zodResolver(formularioSchema),
    defaultValues: { nombre: "", preguntas: [], enviadosA: [] },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userToken = localStorage.getItem("token");

    if (userToken && user.bodaId) {
      setToken(userToken);
      setBodaId(user.bodaId);

      fetch(
        `http://localhost:4000/api/guests/invitados/${user.bodaId}?limit=100`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      )
        .then((res) => res.json())
        .then((data) => setInvitados(data.invitados || []));

      fetch(`http://localhost:4000/api/forms/questions/${user.bodaId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })
        .then((res) => res.json())
        .then((data) => setPreguntas(data || []));
    }
  }, []);

  const onSubmit = async (data: FormularioData) => {
    if (!bodaId || !token) return;
    await crearFormulario({ ...data, bodaId });
    reset();
  };

  /*   const abrirModalEdicion = (form: Formulario) => {
    setFormularioEditando(form);
    setValue("nombre", form.nombre);
    setValue("preguntas", form.preguntas.map((p: any) => p._id));
    setValue("enviadosA", form.enviadosA.map((i: any) => i._id));
    setModalAbierto(true);
  }; */

  const abrirModalEdicion = (form: Formulario) => {
    setFormularioEditando(form);
    setValue("nombre", form.nombre);
    setValue(
      "preguntas",
      form.preguntas.map((p: any) => p._id)
    );
    setValue(
      "enviadosA",
      form.enviadosA.map((i: any) => i._id)
    );

    // ✅ Detectar si es una lista (1 ID y coincide con una lista existente)
    const enviadoEsLista =
      form.enviadosA.length === 1 &&
      listasDifusion.some(
        (l) =>
          l._id ===
          (typeof form.enviadosA[0] === "string"
            ? form.enviadosA[0]
            : (form.enviadosA[0] as { _id: string })._id)
      );

    setModoEnvio(enviadoEsLista ? "lista" : "invitados");
    setModalAbierto(true);
  };

  const guardarCambios = async (data: FormularioData) => {
    if (!formularioEditando) return;
    await editarFormulario(formularioEditando._id, data);
    setModalAbierto(false);
    reset();
  };

  const [modoEnvio, setModoEnvio] = useState<"invitados" | "lista">(
    "invitados"
  );
  const [listasDifusion, setListasDifusion] = useState<
    { _id: string; nombre: string; invitados: any[] }[]
  >([]); // array con listas

  useEffect(() => {
    // Fetch de invitados
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      if (!token || !user?.bodaId) return;

      const invitadosRes = await fetch(
        `http://localhost:4000/api/guests/invitados/${user.bodaId}?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const listasRes = await fetch(`http://localhost:4000/api/lists/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const invitadosData = await invitadosRes.json();
      const listasData = await listasRes.json();

      setInvitados(invitadosData.invitados || []);
      setListasDifusion(listasData || []);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📋 Gestionar Formularios</h2>

      {/* ✅ Formulario para crear una nueva pregunta */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border p-6 rounded-lg shadow-lg space-y-4"
      >
        <div>
          <label className="block font-semibold mb-2">
            📌 Nombre del formulario:
          </label>
          <Controller
            name="nombre"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className="w-full p-2 border rounded"
                placeholder="Ej: Confirmación de asistencia"
              />
            )}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            ❓ Selecciona preguntas:
          </label>
          <Controller
            name="preguntas"
            control={control}
            render={({ field }) => (
              <ClientOnly>
                <Select
                  isMulti
                  options={preguntas.map((p: any) => ({
                    value: p._id,
                    label: p.pregunta,
                  }))}
                  onChange={(selected) =>
                    field.onChange(selected.map((s: any) => s.value))
                  }
                />
              </ClientOnly>
            )}
          />
        </div>
        {/* 🔘 Select para elegir modo de envío */}
        <div>
          <label className="block font-semibold mb-2">
            📤 Enviar formulario a:
          </label>
          <ClientOnly>
            <Select
              value={{
                value: modoEnvio,
                label:
                  modoEnvio === "invitados" ? "Invitados" : "Lista de difusión",
              }}
              onChange={(option) => option && setModoEnvio(option.value)}
              options={[
                { value: "invitados", label: "Invitados" },
                { value: "lista", label: "Lista de difusión" },
              ]}
              className="mb-4"
            />
          </ClientOnly>
        </div>

        {/* 🔁 Select dinámico según la opción */}
        <div>
          {modoEnvio === "invitados" ? (
            <>
              <label className="block font-semibold mb-2">
                🎉 Selecciona invitados:
              </label>
              <Controller
                name="enviadosA"
                control={control}
                render={({ field }) => (
                  <ClientOnly>
                    <Select
                      options={invitados.map((i) => ({
                        value: i._id,
                        label: `${i.nombre} (${i.telefono})`,
                      }))}
                      isMulti
                      className="basic-multi-select"
                      classNamePrefix="select"
                      onChange={(selected) =>
                        field.onChange(selected.map((s) => s.value))
                      }
                    />
                  </ClientOnly>
                )}
              />
            </>
          ) : (
            <>
              <label className="block font-semibold mb-2">
                📋 Selecciona una lista de difusión:
              </label>
              <Controller
                name="enviadosA"
                control={control}
                render={({ field }) => (
                  <ClientOnly>
                    <Select
                      options={listasDifusion.map((l) => ({
                        value: l._id,
                        label: `${l.nombre} (${l.invitados.length} invitados)`,
                      }))}
                      isMulti={false}
                      className="basic-single-select"
                      classNamePrefix="select"
                      onChange={(selected) =>
                        selected && field.onChange([selected.value])
                      }
                    />
                  </ClientOnly>
                )}
              />
            </>
          )}
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          ✅ Crear Formulario
        </button>
      </form>

      {/* 📜 Lista de Formularios */}
      <h3 className="text-xl font-semibold mt-6 mb-2">
        📜 Formularios Creados:
      </h3>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        formularios.map((form) => (
          <div
            key={form._id}
            className="border p-4 rounded-lg flex justify-between items-center mb-1.5"
          >
            <p className="font-bold">{form.nombre}</p>
            <div className="flex gap-2">
              <button
                onClick={() => eliminarFormulario(form._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                🗑️
              </button>
              <button
                onClick={() => abrirModalEdicion(form)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                ✏️
              </button>
            </div>
          </div>
        ))
      )}

      {/* ✅ Modal de edición */}
      {/*  {modalAbierto && (
        <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="✏️ Editar Formulario">
          <form onSubmit={handleSubmit(guardarCambios)} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">📌 Nombre:</label>
              <Controller name="nombre" control={control} render={({ field }) => (
                <input {...field} className="w-full p-2 border rounded" />
              )} />
            </div>

            <div>
              <label className="block font-semibold mb-2">❓ Preguntas:</label>
              <Controller
                name="preguntas"
                control={control}
                render={({ field }) => (
                  <ClientOnly>
                    <Select
                      isMulti
                      options={preguntas.map((p: any) => ({ value: p._id, label: p.pregunta }))}
                      value={preguntas
                        .filter((p: any) => field.value.includes(p._id))
                        .map((p: any) => ({ value: p._id, label: p.pregunta }))}
                      onChange={(selected) => field.onChange(selected.map((s: any) => s.value))}
                    />
                  </ClientOnly>
                )}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">📩 Enviar a:</label>
              <Controller
                name="enviadosA"
                control={control}
                render={({ field }) => (
                  <ClientOnly>
                    <Select
                      isMulti
                      options={invitados.map((i: any) => ({ value: i._id, label: `${i.nombre} (${i.telefono})` }))}
                      value={invitados
                        .filter((i: any) => field.value.includes(i._id))
                        .map((i: any) => ({ value: i._id, label: `${i.nombre} (${i.telefono})` }))}
                      onChange={(selected) => field.onChange(selected.map((s: any) => s.value))}
                    />
                  </ClientOnly>
                )}
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">💾 Guardar</button>
              <button type="button" onClick={() => setModalAbierto(false)} className="bg-gray-300 px-4 py-2 rounded">❌ Cancelar</button>
            </div>
          </form>
        </Modal>
      )} */}
      {modalAbierto && (
        <Modal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          title="✏️ Editar Formulario"
        >
          <form onSubmit={handleSubmit(guardarCambios)} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">📌 Nombre:</label>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <input {...field} className="w-full p-2 border rounded" />
                )}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">❓ Preguntas:</label>
              <Controller
                name="preguntas"
                control={control}
                render={({ field }) => (
                  <ClientOnly>
                    <Select
                      isMulti
                      options={preguntas.map((p: any) => ({
                        value: p._id,
                        label: p.pregunta,
                      }))}
                      value={preguntas
                        .filter((p: any) => field.value.includes(p._id))
                        .map((p: any) => ({ value: p._id, label: p.pregunta }))}
                      onChange={(selected) =>
                        field.onChange(selected.map((s: any) => s.value))
                      }
                    />
                  </ClientOnly>
                )}
              />
            </div>

            {/* 🔘 Modo de envío */}
            <div>
              <label className="block font-semibold mb-2">
                📤 Modo de envío:
              </label>
              <ClientOnly>
                <Select
                  value={{
                    value: modoEnvio,
                    label:
                      modoEnvio === "invitados"
                        ? "Invitados"
                        : "Lista de difusión",
                  }}
                  onChange={(option) => option && setModoEnvio(option.value)}
                  options={[
                    { value: "invitados", label: "Invitados" },
                    { value: "lista", label: "Lista de difusión" },
                  ]}
                  className="mb-2"
                />
              </ClientOnly>
            </div>

            {/* 🔁 Destinatarios según modo de envío */}
            {modoEnvio === "invitados" ? (
              <>
                <label className="block font-semibold mb-2">
                  🎉 Selecciona invitados:
                </label>
                <Controller
                  name="enviadosA"
                  control={control}
                  render={({ field }) => (
                    <ClientOnly>
                      <Select
                        isMulti
                        options={invitados.map((i) => ({
                          value: i._id,
                          label: `${i.nombre} (${i.telefono})`,
                        }))}
                        value={invitados
                          .filter((i: any) => field.value.includes(i._id))
                          .map((i: any) => ({
                            value: i._id,
                            label: `${i.nombre} (${i.telefono})`,
                          }))}
                        onChange={(selected) =>
                          field.onChange(selected.map((s: any) => s.value))
                        }
                      />
                    </ClientOnly>
                  )}
                />
              </>
            ) : (
              <>
                <label className="block font-semibold mb-2">
                  📋 Selecciona una lista de difusión:
                </label>
                <Controller
                  name="enviadosA"
                  control={control}
                  render={({ field }) => (
                    <ClientOnly>
                      <Select
                        options={listasDifusion.map((l) => ({
                          value: l._id,
                          label: `${l.nombre} (${l.invitados.length} invitados)`,
                        }))}
                        value={listasDifusion
                          .filter((l) => field.value.includes(l._id))
                          .map((l) => ({
                            value: l._id,
                            label: `${l.nombre} (${l.invitados.length} invitados)`,
                          }))}
                        isMulti={false}
                        className="basic-single-select"
                        classNamePrefix="select"
                        onChange={(selected) =>
                          selected && field.onChange([selected.value])
                        }
                      />
                    </ClientOnly>
                  )}
                />
              </>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                💾 Guardar
              </button>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
