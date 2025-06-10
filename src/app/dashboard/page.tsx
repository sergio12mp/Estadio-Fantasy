//app/dashboard/page.tsx

"use client";

import RequireAdmin from "@/components/RequireAdmin";
import SeleccionarJornada from "@/components/SeleccionarJornada";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const { manager, setCurrency } = useAuth();
  const [fechaActual, setFechaActual] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeFecha, setMensajeFecha] = useState(""); 
  const [procesandoCSV, setProcesandoCSV] = useState(false);
  const [mensajeCSV, setMensajeCSV] = useState("");

  const [currencyManagerId, setCurrencyManagerId] = useState("");
  const [oro, setOro] = useState("0");
  const [balones, setBalones] = useState("0");
  const [mensajeMonedas, setMensajeMonedas] = useState("");

  useEffect(() => {
    const cargar = async () => {
      const res = await fetch("/api/simulated-time");
      const data = await res.json();
      const fechaIso = new Date(data.fecha).toISOString().slice(0, 16);
      setFechaActual(fechaIso);
      setNuevaFecha(fechaIso);
    };

    cargar();
  }, []);

  const guardarFecha = async () => {
    setGuardando(true);
    setMensajeFecha(""); 

    try {
      const res = await fetch("/api/simulated-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: nuevaFecha }),
      });

      if (res.ok) {
        setMensajeFecha("Fecha actualizada correctamente.");
        setFechaActual(nuevaFecha);
      } else {
        const data = await res.json();
        setMensajeFecha(data.error || "Error al actualizar.");
      }
    } catch (err) {
      setMensajeFecha("Error de red.");
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarProcesarCSV = async () => {
    setProcesandoCSV(true);
    setMensajeCSV(""); 

    try {
      const res = await fetch("/api/procesarCSV", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setMensajeCSV(data.message || "Procesamiento de CSV completado.");
      } else {
        const data = await res.json();
        setMensajeCSV(data.error || "Error al procesar el CSV.");
        console.error("Error respuesta API CSV:", data.error);
      }
    } catch (err) {
      setMensajeCSV("Error de red al intentar procesar el CSV.");
      console.error("Error fetch CSV:", err);
    } finally {
      setProcesandoCSV(false);
    }
  };

  const agregarMonedas = async () => {
    setMensajeMonedas("");
    const res = await fetch("/api/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        managerId: Number(currencyManagerId),
        deltaOro: Number(oro),
        deltaBalones: Number(balones),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMensajeMonedas("Monedas añadidas");
      if (manager && manager.idManager === Number(currencyManagerId)) {
        setCurrency(data);
      }
    } else {
      setMensajeMonedas("Error al añadir monedas");
    }
  };


  return (
    // <RequireAdmin>
      
      <div className="min-h-screen bg-gray-50 py-10"> {/* Fondo de página más claro */}
        <div className="max-w-2xl mx-auto px-4"> {/* Eliminado mt-10 ya que py-10 ya da espacio */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Panel de Administración</h1>

          {/* Sección de Control de Tiempo Simulado */}
          {/* El texto dentro de este div ya tiene un color oscuro por defecto (text-gray-800 o text-gray-900) */}
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🕒 Control de Tiempo Simulado</h2>

            {/* El label ahora es text-gray-800 */}
            <label className="block text-gray-800 font-medium mb-2">
              Fecha actual simulada:
            </label>

            <input
              type="datetime-local"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-gray-900" /* Añadido text-gray-900 */
            />

            <button
              onClick={guardarFecha}
              disabled={guardando}
              className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>

            {mensajeFecha && <p className="mt-3 text-sm text-gray-800">{mensajeFecha}</p>}
          </div>

          {/* Sección de Procesamiento de Datos CSV */}
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">⚙️ Procesamiento de Datos CSV</h2>
              <p className="text-gray-700 mb-4">Haz clic para importar y procesar los datos del archivo CSV de partidos en la base de datos.</p> {/* Añadido text-gray-700 */}
              <button
                  onClick={ejecutarProcesarCSV}
                  disabled={procesandoCSV}
                  className="bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition"
              >
                  {procesandoCSV ? "Procesando CSV..." : "Procesar CSV"}
              </button>
          {mensajeCSV && <p className="mt-3 text-sm text-gray-800">{mensajeCSV}</p>} {/* Añadido text-gray-800 */}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">💰 Añadir monedas</h2>
            <div className="flex flex-col gap-2 mb-2">
              <label className="text-sm">ID Manager</label>
              <input
                type="text"
                value={currencyManagerId}
                onChange={(e) => setCurrencyManagerId(e.target.value)}
                className="border px-2 py-1 text-black"
              />
              <label className="text-sm">Oro</label>
              <input
                type="number"
                value={oro}
                onChange={(e) => setOro(e.target.value)}
                className="border px-2 py-1 text-black"
              />
              <label className="text-sm">Balones</label>
              <input
                type="number"
                value={balones}
                onChange={(e) => setBalones(e.target.value)}
                className="border px-2 py-1 text-black"
              />
              <button onClick={agregarMonedas} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Agregar</button>
            </div>
            {mensajeMonedas && <p className="text-sm">{mensajeMonedas}</p>}
          </div>


          {/* Sección de Obtener estadísticas por jornada */}
          {/* El texto dentro de este div ya tiene un color oscuro por defecto */}
          <div className="bg-white p-6 rounded shadow-md border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Obtener estadísticas por jornada</h2>
            <div className="flex gap-4 mb-4">
              <SeleccionarJornada /> {/* Asegúrate que este componente también tenga texto oscuro si su fondo es blanco */}
            </div>
            {/* Si este p es para errores, el rojo está bien, pero si es texto normal, podría ser oscuro */}
            <p className="text-red-600 text-sm"></p>
          </div>
        </div>
      </div>
    // </RequireAdmin>
  );
}