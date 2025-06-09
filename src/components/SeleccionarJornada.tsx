"use client";

import { useState } from "react";

export default function SeleccionarJornada() {
  const [jornada, setJornada] = useState("");
  const [datos, setDatos] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleObtenerDatos = async () => {
    if (!jornada) return;
    setLoading(true);
    setError("");
    setDatos(null);

    try {
      const res = await fetch("/api/obtener-datos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jornada }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error desconocido");
      }

      setDatos(data.datos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 bg-white p-6 rounded shadow-md border">
      <h2 className="text-xl font-semibold mb-4">📊 Obtener estadísticas por jornada</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="number"
          placeholder="Número de jornada"
          value={jornada}
          onChange={(e) => setJornada(e.target.value)}
          className="border px-3 py-2 rounded w-40"
        />

        <button
          onClick={handleObtenerDatos}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Consultando..." : "Obtener datos"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {datos && (
        <div className="overflow-auto mt-6 max-h-[500px] border rounded">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {datos[0]?.map((col, i) => (
                  <th key={i} className="p-2 border-b font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.slice(1).map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  {row.map((cell, j) => (
                    <td key={j} className="p-2 border-b">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
