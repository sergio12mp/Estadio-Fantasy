// components/objectSelectionModal.tsx
'use client';

import React, { useState } from 'react';
import { CartaJugadorEnPlantilla, CartaObjetoManager, ObjetoEquipado } from '@/lib/data';

interface ObjectSelectionModalProps {
  jugador: CartaJugadorEnPlantilla;
  availableObjects: CartaObjetoManager[];
  onClose: () => void;
  onConfirmEquip: (playerId: number, updatedEquippedObjects: ObjetoEquipado[]) => void;
}

const RAREZA_COLORS: Record<string, string> = {
  Común: 'border-gray-300 bg-gray-50',
  Raro: 'border-blue-400 bg-blue-50',
  Épico: 'border-purple-500 bg-purple-50',
  Legendario: 'border-yellow-500 bg-yellow-50',
};

export default function ObjectSelectionModal({
  jugador,
  availableObjects,
  onClose,
  onConfirmEquip,
}: ObjectSelectionModalProps) {
  const [selected, setSelected] = useState<CartaObjetoManager[]>(
    // Pre-seleccionar los objetos ya equipados
    jugador.objetosEquipados
      .map(eq => availableObjects.find(o => o.idCartaObjeto === eq.idCartaObjeto))
      .filter(Boolean) as CartaObjetoManager[]
  );

  const maxSlots = jugador.maxObjetosSlots;

  const toggle = (obj: CartaObjetoManager) => {
    setSelected(prev => {
      const yaSeleccionado = prev.some(o => o.idCartaObjeto === obj.idCartaObjeto);
      if (yaSeleccionado) {
        return prev.filter(o => o.idCartaObjeto !== obj.idCartaObjeto);
      }
      if (prev.length >= maxSlots) return prev; // no añadir si slots llenos
      return [...prev, obj];
    });
  };

  const handleConfirm = () => {
    const equipados: ObjetoEquipado[] = selected.map(o => ({
      idCartaObjeto: o.idCartaObjeto,
      Nombre: o.NombreObjeto,
      Rareza: o.Rareza,
      Efecto: o.EfectoObjeto,
      ValorEfecto: o.ValorEfecto,
    }));
    onConfirmEquip(jugador.idCartaJugador, equipados);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Equipar Objetos — {jugador.Nombre}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Slots disponibles: <span className="font-semibold text-gray-800">{selected.length} / {maxSlots}</span>
          {maxSlots === 0 && <span className="ml-2 text-red-500">(Las cartas Comunes no pueden equipar objetos)</span>}
        </p>

        {availableObjects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tienes objetos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {availableObjects.map(obj => {
              const seleccionado = selected.some(o => o.idCartaObjeto === obj.idCartaObjeto);
              const lleno = selected.length >= maxSlots && !seleccionado;
              return (
                <button
                  key={obj.idCartaObjeto}
                  onClick={() => toggle(obj)}
                  disabled={lleno || maxSlots === 0}
                  className={`text-left rounded-lg border-2 p-3 transition-all ${
                    RAREZA_COLORS[obj.Rareza] ?? 'border-gray-200 bg-white'
                  } ${seleccionado ? 'ring-2 ring-blue-500' : ''} ${
                    lleno || maxSlots === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-gray-900">{obj.NombreObjeto}</span>
                    {seleccionado && <span className="text-blue-600 text-xs font-bold">✓</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{obj.Rareza}</p>
                  {obj.DescripcionObjeto && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{obj.DescripcionObjeto}</p>
                  )}
                  {obj.ValorEfecto && obj.ValorEfecto !== 1 && (
                    <p className="text-xs text-green-700 font-semibold mt-1">×{obj.ValorEfecto} puntos</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
