"use client";

import { useState, useEffect } from "react";
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

  // Bots
  const [seedingBots, setSeedingBots] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [settingBotPlantilla, setSettingBotPlantilla] = useState(false);
  const [botPlantillaStatus, setBotPlantillaStatus] = useState<string | null>(null);
  const [idJornadaBots, setIdJornadaBots] = useState("");

  const [gastingBots, setGastingBots] = useState(false);
  const [gastStatus, setGastStatus] = useState<string | null>(null);

  const handleGastarBots = async () => {
    setGastingBots(true);
    setGastStatus(null);
    try {
      const res = await fetch("/api/bots/gastar", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const detalle = data.resumen?.map((b: any) => `${b.nombre}: ${b.sobresAbiertos} sobres`).join(", ");
        setGastStatus(`✅ ${data.message}. ${detalle}`);
      } else {
        setGastStatus(`❌ Error: ${data.error ?? "Error desconocido"}`);
      }
    } catch (err: any) {
      setGastStatus(`❌ Error de red: ${err.message}`);
    } finally {
      setGastingBots(false);
    }
  };

  const handleSeedBots = async () => {
    setSeedingBots(true);
    setSeedStatus(null);
    try {
      const res = await fetch("/api/bots/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) setSeedStatus(`✅ ${data.message}: ${data.bots?.join(", ")}`);
      else setSeedStatus(`❌ Error: ${data.error ?? "Error desconocido"}`);
    } catch (err: any) {
      setSeedStatus(`❌ Error de red: ${err.message}`);
    } finally {
      setSeedingBots(false);
    }
  };

  const handleSetBotPlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(idJornadaBots);
    if (!id || isNaN(id)) return;
    setSettingBotPlantilla(true);
    setBotPlantillaStatus(null);
    try {
      const res = await fetch("/api/bots/set-plantilla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idJornada: id }),
      });
      const data = await res.json();
      if (res.ok) setBotPlantillaStatus(`✅ ${data.message} (criterio: ${data.criterio}, bots asignados: ${data.botsAsignados})`);
      else setBotPlantillaStatus(`❌ Error: ${data.error ?? "Error desconocido"}`);
    } catch (err: any) {
      setBotPlantillaStatus(`❌ Error de red: ${err.message}`);
    } finally {
      setSettingBotPlantilla(false);
    }
  };

  // Gestión de jornada actual
  const [jornadaActual, setJornadaActual] = useState<{ idJornada: number; nombre: string } | null>(null);
  const [jornadasDisponibles, setJornadasDisponibles] = useState<{ idJornada: number; Nombre: string }[]>([]);
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState("");
  const [settingJornada, setSettingJornada] = useState(false);
  const [setJornadaStatus, setSetJornadaStatus] = useState<string | null>(null);
  const [avanzando, setAvanzando] = useState(false);
  const [avanzarStatus, setAvanzarStatus] = useState<string | null>(null);

  const cargarJornadaActual = async () => {
    try {
      const res = await fetch("/api/config/jornada-actual");
      if (res.ok) {
        const data = await res.json();
        setJornadaActual(data);
        setJornadaSeleccionada(String(data.idJornada));
      }
    } catch {}
  };

  const cargarJornadasDisponibles = async () => {
    try {
      const res = await fetch("/api/jornada");
      if (res.ok) {
        const data = await res.json();
        setJornadasDisponibles(data.result ?? []);
      }
    } catch {}
  };

  // Cargar al montar
  useEffect(() => {
    cargarJornadaActual();
    cargarJornadasDisponibles();
  }, []);

  const handleSetJornada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jornadaSeleccionada) return;
    setSettingJornada(true);
    setSetJornadaStatus(null);
    try {
      const res = await fetch("/api/config/jornada-actual", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idJornada: parseInt(jornadaSeleccionada) }),
      });
      const data = await res.json();
      if (res.ok) {
        setSetJornadaStatus(`✅ Jornada actual: ${data.nombre} (ID ${data.idJornada})`);
        setJornadaActual({ idJornada: data.idJornada, nombre: data.nombre });
      } else {
        setSetJornadaStatus(`❌ ${data.error}`);
      }
    } catch (err: any) {
      setSetJornadaStatus(`❌ Error de red: ${err.message}`);
    } finally {
      setSettingJornada(false);
    }
  };

  const handleAvanzarJornada = async () => {
    if (!confirm(`¿Calcular puntos de "${jornadaActual?.nombre}" y avanzar a la siguiente jornada?`)) return;
    setAvanzando(true);
    setAvanzarStatus(null);
    try {
      const res = await fetch("/api/jornada/avanzar", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const msg = data.hayMasJornadas
          ? `✅ ${data.message} (${data.plantillasProcesadas} plantillas calculadas)`
          : `✅ ${data.message} — última jornada alcanzada.`;
        setAvanzarStatus(msg);
        await cargarJornadaActual();
      } else {
        setAvanzarStatus(`❌ ${data.error}`);
      }
    } catch (err: any) {
      setAvanzarStatus(`❌ Error de red: ${err.message}`);
    } finally {
      setAvanzando(false);
    }
  };

  // Calcular jornada
  const [idJornada, setIdJornada] = useState("");
  const [calcStatus, setCalcStatus] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  const CHUNK_ROWS = 80;

  async function sendCSVChunk(csvText: string, fieldName: "file" | "filePorteros"): Promise<{ filas: number; filasPorteros?: number }> {
    const blob = new Blob([csvText], { type: "text/csv" });
    const formData = new FormData();
    formData.append(fieldName, blob, "chunk.csv");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55_000);
    let res: Response;
    try {
      res = await fetch("/api/procesarCSV", { method: "POST", body: formData, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
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

        <Section title="Gestión de Bots">
          <p className="text-sm text-gray-500 mb-4">
            Crea los managers bot y asígnales plantillas automáticas antes de calcular cada jornada.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">1. Crear bots (solo una vez)</p>
              <button
                onClick={handleSeedBots}
                disabled={seedingBots}
                className="bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {seedingBots ? "Creando..." : "Crear Bots"}
              </button>
              {seedStatus && (
                <p className={`mt-2 text-sm font-medium ${seedStatus.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
                  {seedStatus}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">2. Gastar oro de bots en sobres normales</p>
              <button
                onClick={handleGastarBots}
                disabled={gastingBots}
                className="bg-yellow-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {gastingBots ? "Abriendo sobres..." : "Gastar Oro de Bots"}
              </button>
              {gastStatus && (
                <p className={`mt-2 text-sm font-medium ${gastStatus.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
                  {gastStatus}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">3. Establecer plantillas de bots para una jornada</p>
              <form onSubmit={handleSetBotPlantilla} className="flex gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID de Jornada</label>
                  <input
                    type="number"
                    min={1}
                    value={idJornadaBots}
                    onChange={(e) => setIdJornadaBots(e.target.value)}
                    placeholder="Ej: 1"
                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!idJornadaBots || settingBotPlantilla}
                  className="bg-orange-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {settingBotPlantilla ? "Asignando..." : "Establecer Plantillas"}
                </button>
              </form>
              {botPlantillaStatus && (
                <p className={`mt-2 text-sm font-medium ${botPlantillaStatus.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
                  {botPlantillaStatus}
                </p>
              )}
            </div>
          </div>
        </Section>

        <Section title="Jornada Actual">
          <p className="text-sm text-gray-500 mb-4">
            Controla qué jornada ven los managers al construir su plantilla. Al avanzar, se calculan automáticamente los puntos de la jornada completada.
          </p>
          {jornadaActual && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <p className="text-sm font-semibold text-blue-800">
                Jornada actual: <span className="font-bold">{jornadaActual.nombre}</span>{" "}
                <span className="text-blue-500">(ID {jornadaActual.idJornada})</span>
              </p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSetJornada} className="flex gap-3 items-end flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Establecer jornada actual</label>
                <select
                  value={jornadaSeleccionada}
                  onChange={(e) => setJornadaSeleccionada(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">— Selecciona —</option>
                  {jornadasDisponibles.map((j) => (
                    <option key={j.idJornada} value={j.idJornada}>
                      {j.Nombre} (ID {j.idJornada})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={!jornadaSeleccionada || settingJornada}
                className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {settingJornada ? "Guardando..." : "Establecer"}
              </button>
            </form>
            {setJornadaStatus && (
              <p className={`text-sm font-medium ${setJornadaStatus.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
                {setJornadaStatus}
              </p>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Calcular jornada actual y avanzar a la siguiente</p>
              <button
                onClick={handleAvanzarJornada}
                disabled={avanzando || !jornadaActual}
                className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {avanzando ? "Calculando y avanzando..." : "⏭ Avanzar jornada"}
              </button>
            </div>
            {avanzarStatus && (
              <p className={`text-sm font-medium ${avanzarStatus.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
                {avanzarStatus}
              </p>
            )}
          </div>
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
