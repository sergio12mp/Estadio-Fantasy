"use client";

import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function AdminContent() {
  // CSV Upload
  const [file, setFile] = useState<File | null>(null);
  const [filePorteros, setFilePorteros] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Rellenar cartas comunes
  const [fillingCards, setFillingCards] = useState(false);
  const [fillStatus, setFillStatus] = useState<string | null>(null);

  const handleFillCards = async () => {
    setFillingCards(true);
    setFillStatus(null);
    try {
      const res = await fetch("/api/fill-common-cards", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setFillStatus(`✅ ${data.message} (${data.cardsCreated ?? 0} cartas creadas)`);
      } else {
        setFillStatus(`❌ Error: ${data.error ?? "Error desconocido"}`);
      }
    } catch (err: any) {
      setFillStatus(`❌ Error de red: ${err.message}`);
    } finally {
      setFillingCards(false);
    }
  };

  // Calcular jornada
  const [idJornada, setIdJornada] = useState("");
  const [calcStatus, setCalcStatus] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  const CHUNK_ROWS = 400;

  async function sendCSVChunk(csvText: string, fieldName: "file" | "filePorteros"): Promise<{ filas: number; filasPorteros?: number }> {
    const blob = new Blob([csvText], { type: "text/csv" });
    const formData = new FormData();
    formData.append(fieldName, blob, "chunk.csv");
    const res = await fetch("/api/procesarCSV", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? data.message ?? `HTTP ${res.status}`);
    return data;
  }

  function splitCSV(text: string, chunkSize: number): string[] {
    const lines = text.split("\n");
    const header = lines[0];
    const dataLines = lines.slice(1).filter((l) => l.trim().length > 0);
    const chunks: string[] = [];
    for (let i = 0; i < dataLines.length; i += chunkSize) {
      chunks.push([header, ...dataLines.slice(i, i + chunkSize)].join("\n"));
    }
    return chunks.length > 0 ? chunks : [header];
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const csvText = await file.text();
      const chunks = splitCSV(csvText, CHUNK_ROWS);
      let totalFilas = 0;
      for (let i = 0; i < chunks.length; i++) {
        setUploadStatus(`Enviando lote ${i + 1} de ${chunks.length}...`);
        const data = await sendCSVChunk(chunks[i], "file");
        totalFilas += data.filas ?? 0;
      }

      let totalPorteros = 0;
      if (filePorteros) {
        const csvPorteros = await filePorteros.text();
        const chunksPorteros = splitCSV(csvPorteros, CHUNK_ROWS);
        for (let i = 0; i < chunksPorteros.length; i++) {
          setUploadStatus(`Enviando porteros, lote ${i + 1} de ${chunksPorteros.length}...`);
          const data = await sendCSVChunk(chunksPorteros[i], "filePorteros");
          totalPorteros += data.filasPorteros ?? 0;
        }
      }

      const portMsg = filePorteros ? ` (${totalPorteros} porteros actualizados)` : "";
      setUploadStatus(`✅ CSV procesado: ${totalFilas} filas importadas.${portMsg}`);
    } catch (err: any) {
      setUploadStatus(`❌ Error de red: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCalcular = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(idJornada);
    if (!id || isNaN(id)) return;
    setCalculating(true);
    setCalcStatus(null);
    try {
      const res = await fetch(`/api/jornada/${id}/calcular`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCalcStatus(`✅ Jornada ${id} calculada. Plantillas procesadas: ${data.plantillasProcesadas ?? "?"}`);
      } else {
        setCalcStatus(`❌ Error: ${data.error ?? data.message ?? "Error desconocido"}`);
      }
    } catch (err: any) {
      setCalcStatus(`❌ Error de red: ${err.message}`);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[60px]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel de Admin</h1>

        <Section title="Importar Estadísticas (CSV)">
          <p className="text-sm text-gray-500 mb-4">
            Sube el CSV de jugadores (script R — summary) y opcionalmente el CSV de porteros (script R — keeper). Se crearán jornadas, equipos, jugadores y estadísticas automáticamente.
          </p>
          <form onSubmit={handleUpload} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CSV Jugadores (summary) *</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CSV Porteros (keeper) — opcional</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFilePorteros(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100"
              />
            </div>
            <button
              type="submit"
              disabled={!file || uploading}
              className="self-start bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Importando..." : "Importar CSV"}
            </button>
          </form>
          {uploadStatus && (
            <p className={`mt-3 text-sm font-medium ${uploadStatus.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
              {uploadStatus}
            </p>
          )}
        </Section>

        <Section title="Rellenar Cartas Comunes">
          <p className="text-sm text-gray-500 mb-4">
            Asigna una carta Común de cada jugador a todos los managers que aún no la tengan. Útil tras importar nuevos jugadores.
          </p>
          <button
            onClick={handleFillCards}
            disabled={fillingCards}
            className="bg-purple-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {fillingCards ? "Procesando..." : "Rellenar Cartas Comunes"}
          </button>
          {fillStatus && (
            <p className={`mt-3 text-sm font-medium ${fillStatus.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
              {fillStatus}
            </p>
          )}
        </Section>

        <Section title="Calcular Puntuación de Jornada">
          <p className="text-sm text-gray-500 mb-4">
            Calcula los puntos de todos los managers para una jornada. Actualiza <code className="bg-gray-100 px-1 rounded">Plantilla.Puntos</code> y <code className="bg-gray-100 px-1 rounded">Manager.puntuacion_actual</code>.
          </p>
          <form onSubmit={handleCalcular} className="flex gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID de Jornada</label>
              <input
                type="number"
                min={1}
                value={idJornada}
                onChange={(e) => setIdJornada(e.target.value)}
                placeholder="Ej: 1"
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={!idJornada || calculating}
              className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {calculating ? "Calculando..." : "Calcular"}
            </button>
          </form>
          {calcStatus && (
            <p className={`mt-3 text-sm font-medium ${calcStatus.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
              {calcStatus}
            </p>
          )}
        </Section>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth>
      <AdminContent />
    </RequireAuth>
  );
}
