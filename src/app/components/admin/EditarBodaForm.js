"use client";
import { useState, useEffect } from "react";
import { getBodaById, updateBoda } from "../../services/adminService";
import { useRouter } from "next/navigation";

export default function EditarBodaForm({ bodaId }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    ubicacion: "",
    detalles: "",
    whatsappNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener los datos de la boda al cargar el componente
  useEffect(() => {
    async function fetchBoda() {
      try {
        setLoading(true);
        const boda = await getBodaById(bodaId);
        setFormData({
          nombre: boda.nombre,
          fecha: boda.fecha.split("T")[0], // Formatear fecha
          ubicacion: boda.ubicacion,
          detalles: boda.detalles || "",
          whatsappNumber: boda.whatsappNumber,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (bodaId) fetchBoda();
  }, [bodaId]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBoda(bodaId, formData);
      alert("✅ Boda actualizada correctamente.");
      router.push("/admin/bodas"); // Redirigir al listado de bodas
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Editar Boda</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre de la boda"
            className="border p-2 w-full"
            required
          />
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            placeholder="Ubicación"
            className="border p-2 w-full"
            required
          />
          <textarea
            name="detalles"
            value={formData.detalles}
            onChange={handleChange}
            placeholder="Detalles de la boda"
            className="border p-2 w-full"
          />
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            placeholder="Número de WhatsApp"
            className="border p-2 w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}
    </div>
  );
}
