"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function UploadExcel({ onUpload }: { onUpload: (file: File, data: any[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null); // Reset error

    // Leer el archivo con FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });

      // Leer la primera hoja del archivo
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      console.log("📂 Datos del archivo:", jsonData);
      setPreviewData(jsonData); // Guardamos la previsualización
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleUpload = () => {
    if (!file || previewData.length === 0) {
      setError("⚠ Debe seleccionar un archivo válido.");
      return;
    }

    onUpload(file, previewData); // Enviar al backend
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-semibold mb-4">📂 Subir archivo Excel</h2>

      <input type="file" accept=".xlsx,.csv" onChange={handleFileChange} className="mb-4" />

      {file && <p className="text-sm text-gray-600">📄 Archivo seleccionado: {file.name}</p>}

      {previewData.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-semibold">🔍 Previsualización:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 mt-2">
              <thead className="bg-gray-200">
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key} className="border px-4 py-2">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((row, index) => ( // Mostrar solo 5 filas
                  <tr key={index} className="border">
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="border px-4 py-2">{value as string}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">❌ {error}</p>}

      {previewData.length > 0 && (
        <button onClick={handleUpload} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
          ✅ Confirmar y Enviar
        </button>
      )}
    </div>
  );
}
