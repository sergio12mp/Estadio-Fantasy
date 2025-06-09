"use client";

import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/auth-context";
import { updateManager } from "@/lib/data";
import { useEffect, useState } from "react";

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
    if (!user || !manager) return;

    setGuardando(true);
    setMensaje("");

    try {
      await updateManager(user.uid, {
        nombre: nuevoNombre,
        email: user.email ?? "",
        idGoogle: user.uid,
      });

      setManager({ ...manager, nombre: nuevoNombre }); // ✅ Actualiza en contexto
      setMensaje("Nombre actualizado correctamente.");
    } catch (err) {
      console.error(err);
      setMensaje("Error al actualizar el nombre.");
    } finally {
      setGuardando(false);
      setModalOpen(false);
    }
  };
console.log("manager", manager);
  return (
    <RequireAuth>
      <div className="max-w-xl mx-auto mt-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Mi perfil</h1>

        <div className="bg-white shadow-md rounded p-6 flex flex-col items-center gap-4">
          <img
            src={user?.photoURL ?? "/default-avatar.png"}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full object-cover"
          />

          <div className="w-full text-center">
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="text-md font-medium text-black bg-gray-100 rounded py-1 px-3 inline-block">
              {user?.email}
            </p>
          </div>

          <div className="w-full text-center">
            <p className="text-sm text-gray-600 mb-1">Nombre</p>
            <div className="flex justify-center items-center gap-2">
              <p className="text-lg font-semibold text-gray-900">
                {manager?.nombre ?? "Cargando..."}
              </p>
              <button
                onClick={abrirModal}
                className="border border-gray-400 text-sm px-2 py-1 rounded hover:bg-gray-100 transition"
                aria-label="Editar nombre"
              >
                ✏️
              </button>
            </div>
          </div>

          <div className="w-full text-center">
            <p className="text-sm text-gray-600 mb-1">Monedas</p>
            <p className="text-md font-medium text-black bg-gray-100 rounded py-1 px-3 inline-block">
              {currency.oro} oro · {currency.balones} balones
            </p>
          </div>

          {mensaje && <p className="text-sm mt-2 text-gray-700">{mensaje}</p>}
        </div>

        {/* MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md text-black">
              <h2 className="text-xl font-bold mb-4">Editar nombre</h2>

              <input
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="w-full px-3 py-2 border rounded mb-4 text-black bg-white"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarNombre}
                  disabled={guardando}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
