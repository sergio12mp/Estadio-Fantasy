"use client";

import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";

export default function MiPerfilPage() {
  const { user, manager, setManager, currency } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const abrirModal = () => {
    setNuevoNombre(manager?.nombre ?? "");
    setModalOpen(true);
  };

  const guardarNombre = async () => {
    if (!manager) return;
    setGuardando(true);
    setMensaje("");
    try {
      const res = await fetch(`/api/manager/${manager.idManager}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setManager({ ...manager, nombre: nuevoNombre });
      setMensaje("Nombre actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setMensaje("Error al actualizar el nombre.");
    } finally {
      setGuardando(false);
      setModalOpen(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[60px]">
        <div className="max-w-lg mx-auto px-4 py-10">

          {/* Profile card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-24 relative" />

            {/* Avatar + name */}
            <div className="flex flex-col items-center -mt-12 px-6 pb-6">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
                <img
                  src={user?.image ?? "/default-avatar.png"}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {manager?.nombre ?? "Cargando..."}
                </h1>
                <button
                  onClick={abrirModal}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Editar nombre"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

              {mensaje && (
                <p className="text-xs mt-2 text-green-600 font-medium">{mensaje}</p>
              )}

              {/* Stats row */}
              <div className="w-full grid grid-cols-3 gap-3 mt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl py-4 text-center">
                  <p className="text-xl font-bold text-yellow-600">🪙</p>
                  <p className="text-lg font-bold text-yellow-700 mt-1">{currency.oro.toLocaleString()}</p>
                  <p className="text-xs text-yellow-500 font-medium">Oro</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl py-4 text-center">
                  <p className="text-xl font-bold text-blue-500">⚽</p>
                  <p className="text-lg font-bold text-blue-700 mt-1">{currency.balones}</p>
                  <p className="text-xs text-blue-500 font-medium">Balones</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl py-4 text-center">
                  <p className="text-xl font-bold text-green-500">⭐</p>
                  <p className="text-lg font-bold text-green-700 mt-1">{manager?.puntuacion_actual ?? 0}</p>
                  <p className="text-xs text-green-500 font-medium">Puntos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit name modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Editar nombre</h2>
              <input
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu nombre de manager"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarNombre}
                  disabled={guardando}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {guardando ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
