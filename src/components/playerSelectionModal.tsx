// components/PlayerSelectionModal.tsx
'use client';

import React, { useMemo, useState } from 'react';
import {
  CartaJugadorManager,
  CartaObjetoManager,
  PosicionFrontend,
  obtenerSlotsObjetoPorRareza,
  getPosicionFrontend,
} from '@/lib/data';

interface PlayerSelectionModalProps {
  position: PosicionFrontend;
  availablePlayers: CartaJugadorManager[];
  availableObjects: CartaObjetoManager[];
  onClose: () => void;
  onConfirm: (jugador: CartaJugadorManager | null, objetos: CartaObjetoManager[]) => void;
  initialPlayer?: CartaJugadorManager | null;
  initialObjects?: CartaObjetoManager[];
}

const RAREZAS = ['Común', 'Raro', 'Épico', 'Legendario'];

const RAREZA_BADGE: Record<string, string> = {
  'Común':      'bg-slate-200 text-slate-700 border-slate-400',
  'Raro':       'bg-blue-100 text-blue-700 border-blue-400',
  'Épico':      'bg-purple-100 text-purple-700 border-purple-400',
  'Legendario': 'bg-yellow-100 text-yellow-700 border-yellow-400',
};

const RAREZA_GRADIENT: Record<string, string> = {
  'Común':      'from-slate-500 via-slate-600 to-slate-700',
  'Raro':       'from-blue-500 via-blue-600 to-blue-800',
  'Épico':      'from-purple-600 via-purple-700 to-purple-900',
  'Legendario': 'from-yellow-400 via-amber-500 to-orange-600',
};

const RAREZA_BORDER: Record<string, string> = {
  'Común':      'border-slate-300',
  'Raro':       'border-blue-400',
  'Épico':      'border-purple-500',
  'Legendario': 'border-yellow-400',
};

const RAREZA_STARS: Record<string, string> = {
  'Común': '★', 'Raro': '★★', 'Épico': '★★★', 'Legendario': '★★★★',
};

const RAREZA_ORDEN: Record<string, number> = {
  'Común': 0, 'Raro': 1, 'Épico': 2, 'Legendario': 3,
};

const OBJETO_RAREZA_COLORS: Record<string, string> = {
  'Común':      'border-slate-300 bg-slate-50',
  'Raro':       'border-blue-400 bg-blue-50',
  'Épico':      'border-purple-500 bg-purple-50',
  'Legendario': 'border-yellow-500 bg-yellow-50',
};

const normalizeRareza = (r: string): string => {
  if (!r) return 'Común';
  const map: Record<string, string> = {
    'comun': 'Común', 'común': 'Común',
    'raro': 'Raro', 'rara': 'Raro',
    'epico': 'Épico', 'epica': 'Épico', 'épico': 'Épico', 'épica': 'Épico',
    'legendario': 'Legendario', 'legendaria': 'Legendario',
  };
  const key = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return map[key] ?? r;
};

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  position,
  availablePlayers,
  availableObjects,
  onClose,
  onConfirm,
  initialPlayer,
  initialObjects = [],
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRareza, setFiltroRareza] = useState<string[]>([]);
  const [filtroEquipo, setFiltroEquipo] = useState('todos');
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'rareza' | 'puntos'>('rareza');

  const [step, setStep] = useState<'select' | 'configure'>(() =>
    initialPlayer ? 'configure' : 'select'
  );
  const [selectedPlayer, setSelectedPlayer] = useState<CartaJugadorManager | null>(() =>
    initialPlayer ?? null
  );
  const [equippedObjects, setEquippedObjects] = useState<(CartaObjetoManager | null)[]>(() => {
    if (!initialPlayer) return [];
    const rNorm = normalizeRareza(initialPlayer.Rareza) as 'Común' | 'Raro' | 'Épico' | 'Legendario';
    const slots = obtenerSlotsObjetoPorRareza(rNorm);
    const result: (CartaObjetoManager | null)[] = Array(slots).fill(null);
    initialObjects.forEach((obj, i) => { if (i < slots) result[i] = obj; });
    return result;
  });

  // Object picker mini-modal
  const [slotPickerIdx, setSlotPickerIdx] = useState<number | null>(null);

  // Object picker filters
  const [objBusqueda, setObjBusqueda] = useState('');
  const [objFiltroRareza, setObjFiltroRareza] = useState<string[]>([]);
  const [objFiltroEstadistica, setObjFiltroEstadistica] = useState('todos');
  const [objFiltroEfecto, setObjFiltroEfecto] = useState('todos');

  const jugadoresPosicion = useMemo(() => {
    return availablePlayers.filter(player => {
      try {
        return getPosicionFrontend(player.PosicionJugadorDB) === position;
      } catch {
        return false;
      }
    });
  }, [availablePlayers, position]);

  const equiposUnicos = useMemo(() => {
    const equipos = jugadoresPosicion.map(j => j.NombreEquipo).filter(Boolean);
    return ['todos', ...Array.from(new Set(equipos)).sort()];
  }, [jugadoresPosicion]);

  const toggleRareza = (rareza: string) => {
    setFiltroRareza(prev =>
      prev.includes(rareza) ? prev.filter(r => r !== rareza) : [...prev, rareza]
    );
  };

  const jugadoresFiltrados = useMemo(() => {
    let list = jugadoresPosicion;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(j =>
        j.NombreJugador.toLowerCase().includes(q) ||
        j.NombreEquipo?.toLowerCase().includes(q)
      );
    }
    if (filtroRareza.length > 0) {
      list = list.filter(j => filtroRareza.includes(normalizeRareza(j.Rareza)));
    }
    if (filtroEquipo !== 'todos') {
      list = list.filter(j => j.NombreEquipo === filtroEquipo);
    }
    list = [...list].sort((a, b) => {
      if (ordenarPor === 'nombre') return a.NombreJugador.localeCompare(b.NombreJugador);
      if (ordenarPor === 'rareza') {
        const diff = (RAREZA_ORDEN[normalizeRareza(b.Rareza)] ?? 0) - (RAREZA_ORDEN[normalizeRareza(a.Rareza)] ?? 0);
        return diff !== 0 ? diff : a.NombreJugador.localeCompare(b.NombreJugador);
      }
      if (ordenarPor === 'puntos') return (b.Puntos ?? 0) - (a.Puntos ?? 0);
      return 0;
    });
    return list;
  }, [jugadoresPosicion, busqueda, filtroRareza, filtroEquipo, ordenarPor]);

  const rarezaNorm = selectedPlayer
    ? (normalizeRareza(selectedPlayer.Rareza) as 'Común' | 'Raro' | 'Épico' | 'Legendario')
    : 'Común';
  const maxSlots = selectedPlayer ? obtenerSlotsObjetoPorRareza(rarezaNorm) : 0;

  const handlePlayerClick = (player: CartaJugadorManager) => {
    const rNorm = normalizeRareza(player.Rareza) as 'Común' | 'Raro' | 'Épico' | 'Legendario';
    const slots = obtenerSlotsObjetoPorRareza(rNorm);
    setSelectedPlayer(player);
    setEquippedObjects(Array(slots).fill(null));
    setStep('configure');
  };

  const handleConfirm = () => {
    if (!selectedPlayer) return;
    onConfirm(selectedPlayer, equippedObjects.filter(Boolean) as CartaObjetoManager[]);
  };

  const handleObjectSelected = (obj: CartaObjetoManager) => {
    if (slotPickerIdx === null) return;
    setEquippedObjects(prev => {
      const updated = [...prev];
      updated[slotPickerIdx] = obj;
      return updated;
    });
    setSlotPickerIdx(null);
  };

  const handleRemoveObject = (slotIdx: number) => {
    setEquippedObjects(prev => {
      const updated = [...prev];
      updated[slotIdx] = null;
      return updated;
    });
  };

  const objectsForPicker = useMemo(() => {
    const equippedIds = new Set(
      equippedObjects
        .filter(Boolean)
        .map(o => o!.idCartaObjeto)
    );
    // Allow replacing the current slot's object
    if (slotPickerIdx !== null && equippedObjects[slotPickerIdx]) {
      equippedIds.delete(equippedObjects[slotPickerIdx]!.idCartaObjeto);
    }
    return availableObjects.filter(o => !equippedIds.has(o.idCartaObjeto));
  }, [availableObjects, equippedObjects, slotPickerIdx]);

  const estadisticasUnicasObj = useMemo(() => {
    const stats = availableObjects
      .filter(o => o.EstadisticaObjeto)
      .map(o => o.EstadisticaObjeto as string);
    return ['todos', ...Array.from(new Set(stats)).sort()];
  }, [availableObjects]);

  const objectsFiltered = useMemo(() => {
    let list = objectsForPicker;
    if (objBusqueda.trim()) {
      const q = objBusqueda.toLowerCase();
      list = list.filter(o =>
        o.NombreObjeto.toLowerCase().includes(q) ||
        (o.DescripcionObjeto?.toLowerCase().includes(q) ?? false) ||
        (o.EstadisticaObjeto?.toLowerCase().includes(q) ?? false)
      );
    }
    if (objFiltroRareza.length > 0) {
      list = list.filter(o => objFiltroRareza.includes(normalizeRareza(o.Rareza)));
    }
    if (objFiltroEstadistica !== 'todos') {
      list = list.filter(o => o.EstadisticaObjeto === objFiltroEstadistica);
    }
    if (objFiltroEfecto !== 'todos') {
      list = list.filter(o => o.EfectoObjeto === objFiltroEfecto);
    }
    return list;
  }, [objectsForPicker, objBusqueda, objFiltroRareza, objFiltroEstadistica, objFiltroEfecto]);

  const equippedCount = equippedObjects.filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            {step === 'configure' && (
              <button
                onClick={() => { setStep('select'); setSelectedPlayer(null); setEquippedObjects([]); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-sm font-medium flex items-center gap-1"
              >
                ← Volver
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {step === 'select' ? `Seleccionar ${position}` : 'Configurar jugador'}
              </h2>
              <p className="text-sm text-gray-400">
                {step === 'select'
                  ? `${jugadoresFiltrados.length} disponibles`
                  : selectedPlayer?.NombreJugador}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Phase 2: Selected player summary + object slots */}
        {step === 'configure' && selectedPlayer && (
          <div className={`bg-gradient-to-r ${RAREZA_GRADIENT[rarezaNorm]} px-5 py-4 shrink-0`}>
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
                {selectedPlayer.NombreJugador.charAt(0)}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base truncate">{selectedPlayer.NombreJugador}</h3>
                <p className="text-white/70 text-xs truncate">
                  {selectedPlayer.NombreEquipo} · {getPosicionFrontend(selectedPlayer.PosicionJugadorDB)}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RAREZA_BADGE[rarezaNorm]}`}>
                    {rarezaNorm}
                  </span>
                  <span className="text-white/80 text-xs">{RAREZA_STARS[rarezaNorm]}</span>
                  {selectedPlayer.Puntos != null && (
                    <span className={`text-xs font-bold ${selectedPlayer.Puntos < 0 ? 'text-red-300' : 'text-amber-300'}`}>
                      ⭐ {selectedPlayer.Puntos} pts acum.
                    </span>
                  )}
                </div>
              </div>

              {/* Object slots */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                {maxSlots === 0 ? (
                  <p className="text-white/60 text-xs italic text-right">Sin slots<br/>de objeto</p>
                ) : (
                  <>
                    <p className="text-white/70 text-xs text-right">
                      Objetos: {equippedCount}/{maxSlots}
                    </p>
                    <div className="flex gap-2">
                      {Array.from({ length: maxSlots }).map((_, i) => {
                        const obj = equippedObjects[i];
                        return (
                          <button
                            key={i}
                            onClick={() => obj ? handleRemoveObject(i) : setSlotPickerIdx(i)}
                            title={obj ? `${obj.NombreObjeto} (click para quitar)` : 'Click para equipar objeto'}
                            className={`w-12 h-12 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all text-xs font-bold
                              ${obj
                                ? 'border-white bg-white/30 text-white hover:bg-red-400/50 hover:border-red-300'
                                : 'border-white/50 bg-white/10 text-white/60 hover:bg-white/20 hover:border-white hover:text-white'
                              }`}
                          >
                            {obj ? (
                              <>
                                <span className="text-base">🎯</span>
                                <span className="text-[9px] text-white/80 leading-tight max-w-[40px] truncate">{obj.NombreObjeto.split(' ')[0]}</span>
                              </>
                            ) : (
                              <span className="text-lg leading-none">+</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {equippedCount > 0 && (
                      <div className="flex flex-col gap-0.5">
                        {equippedObjects.map((obj, i) =>
                          obj ? (
                            <p key={i} className="text-white/80 text-[11px] truncate max-w-[150px] text-right">
                              🎯 {obj.NombreObjeto}
                            </p>
                          ) : null
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Buscar jugador o equipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 min-w-[160px] px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <select
              value={filtroEquipo}
              onChange={(e) => setFiltroEquipo(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-black dark:text-white"
            >
              {equiposUnicos.map(e => (
                <option key={e} value={e}>{e === 'todos' ? 'Todos los equipos' : e}</option>
              ))}
            </select>
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value as any)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-700 text-black dark:text-white"
            >
              <option value="rareza">Ordenar: Rareza</option>
              <option value="nombre">Ordenar: Nombre</option>
              <option value="puntos">Ordenar: Puntos</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rareza:</span>
            {RAREZAS.map(rareza => {
              const activo = filtroRareza.includes(rareza);
              return (
                <button
                  key={rareza}
                  onClick={() => toggleRareza(rareza)}
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    activo
                      ? RAREZA_BADGE[rareza] + ' opacity-100 scale-105'
                      : 'bg-white dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600 opacity-60'
                  }`}
                >
                  {rareza}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player list */}
        <div className="overflow-y-auto flex-1 p-4">
          {jugadoresFiltrados.length === 0 ? (
            <p className="text-center text-gray-400 mt-8">No hay jugadores disponibles con esos filtros.</p>
          ) : step === 'select' ? (
            /* Phase 1: card grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {jugadoresFiltrados.map((jugador) => {
                const rNorm = normalizeRareza(jugador.Rareza);
                return (
                  <div
                    key={jugador.idCartaJugador}
                    onClick={() => handlePlayerClick(jugador)}
                    className={`rounded-xl overflow-hidden border-2 ${RAREZA_BORDER[rNorm] ?? 'border-gray-300'} shadow-md cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-200`}
                  >
                    <div className={`bg-gradient-to-b ${RAREZA_GRADIENT[rNorm]} px-3 pt-3 pb-6`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white/90 uppercase bg-white/20 px-2 py-0.5 rounded-full">
                          {getPosicionFrontend(jugador.PosicionJugadorDB)}
                        </span>
                        <span className="text-xs text-white/80">{RAREZA_STARS[rNorm]}</span>
                      </div>
                      <div className="w-14 h-14 rounded-full mx-auto mt-1 bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg select-none">
                        {jugador.NombreJugador.charAt(0)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-2 pt-2 pb-2 -mt-3 rounded-t-xl">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center text-xs leading-tight truncate">
                        {jugador.NombreJugador}
                      </h3>
                      <p className="text-xs text-gray-400 text-center truncate">{jugador.NombreEquipo}</p>
                      <div className="flex justify-center mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RAREZA_BADGE[rNorm] ?? ''}`}>
                          {rNorm}
                        </span>
                      </div>
                      {jugador.Puntos != null && (
                        <p className={`text-center text-xs font-semibold mt-0.5 ${jugador.Puntos < 0 ? 'text-red-500' : 'text-amber-600'}`}>
                          ⭐ {jugador.Puntos} pts acum.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Phase 2: card grid — same layout as select, with selection highlight */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {jugadoresFiltrados.map((jugador) => {
                const rNorm = normalizeRareza(jugador.Rareza);
                const isSelected = selectedPlayer?.idCartaJugador === jugador.idCartaJugador;
                return (
                  <div
                    key={jugador.idCartaJugador}
                    onClick={() => handlePlayerClick(jugador)}
                    className={`rounded-xl overflow-hidden border-2 cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : (RAREZA_BORDER[rNorm] ?? 'border-gray-300')
                    }`}
                  >
                    <div className={`bg-gradient-to-b ${RAREZA_GRADIENT[rNorm]} px-3 pt-3 pb-6`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white/90 uppercase bg-white/20 px-2 py-0.5 rounded-full">
                          {getPosicionFrontend(jugador.PosicionJugadorDB)}
                        </span>
                        <span className="text-xs text-white/80">{RAREZA_STARS[rNorm]}</span>
                      </div>
                      <div className="w-14 h-14 rounded-full mx-auto mt-1 bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg select-none">
                        {jugador.NombreJugador.charAt(0)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-2 pt-2 pb-2 -mt-3 rounded-t-xl">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center text-xs leading-tight truncate">
                        {jugador.NombreJugador}
                      </h3>
                      <p className="text-xs text-gray-400 text-center truncate">{jugador.NombreEquipo}</p>
                      <div className="flex justify-center mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RAREZA_BADGE[rNorm] ?? ''}`}>
                          {rNorm}
                        </span>
                      </div>
                      {jugador.Puntos != null && (
                        <p className={`text-center text-xs font-semibold mt-0.5 ${jugador.Puntos < 0 ? 'text-red-500' : 'text-amber-600'}`}>
                          ⭐ {jugador.Puntos} pts acum.
                        </p>
                      )}
                      {isSelected && (
                        <p className="text-center text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">✓ Seleccionado</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0 flex gap-2">
          {step === 'select' ? (
            <>
              <button
                onClick={() => onConfirm(null, [])}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                Vaciar slot
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                {equippedCount > 0 ? `Confirmar (${equippedCount} objeto${equippedCount !== 1 ? 's' : ''})` : 'Confirmar sin objetos'}
              </button>
              <button
                onClick={() => onConfirm(null, [])}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
              >
                Vaciar slot
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Object picker mini-modal (z-[60] to sit above parent modal) */}
      {slotPickerIdx !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Elegir objeto — Slot {slotPickerIdx + 1}
                </h3>
                <p className="text-xs text-gray-400">{objectsFiltered.length} objeto{objectsFiltered.length !== 1 ? 's' : ''} disponibles</p>
              </div>
              <button onClick={() => setSlotPickerIdx(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl leading-none">&times;</button>
            </div>

            {/* Filters */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0 space-y-2">
              {/* Search + dropdowns */}
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Buscar nombre, descripción o estadística..."
                  value={objBusqueda}
                  onChange={(e) => setObjBusqueda(e.target.value)}
                  className="flex-1 min-w-[160px] px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                <select
                  value={objFiltroEstadistica}
                  onChange={(e) => setObjFiltroEstadistica(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                  {estadisticasUnicasObj.map(s => (
                    <option key={s} value={s}>{s === 'todos' ? 'Todas las stats' : s}</option>
                  ))}
                </select>
                <select
                  value={objFiltroEfecto}
                  onChange={(e) => setObjFiltroEfecto(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800 text-black dark:text-white"
                >
                  <option value="todos">Todos los efectos</option>
                  <option value="suma">Suma (+pts)</option>
                  <option value="multiplicador">Multiplicador (×)</option>
                </select>
              </div>
              {/* Rareza pills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rareza:</span>
                {RAREZAS.map(rareza => {
                  const activo = objFiltroRareza.includes(rareza);
                  return (
                    <button
                      key={rareza}
                      onClick={() => setObjFiltroRareza(prev =>
                        prev.includes(rareza) ? prev.filter(r => r !== rareza) : [...prev, rareza]
                      )}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border-2 transition-all ${
                        activo
                          ? RAREZA_BADGE[rareza] + ' opacity-100 scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-600 opacity-60'
                      }`}
                    >
                      {rareza}
                    </button>
                  );
                })}
                {(objBusqueda || objFiltroRareza.length > 0 || objFiltroEstadistica !== 'todos' || objFiltroEfecto !== 'todos') && (
                  <button
                    onClick={() => { setObjBusqueda(''); setObjFiltroRareza([]); setObjFiltroEstadistica('todos'); setObjFiltroEfecto('todos'); }}
                    className="text-xs text-red-500 hover:text-red-700 underline ml-1"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Object list */}
            <div className="overflow-y-auto flex-1 p-4">
              {objectsFiltered.length === 0 ? (
                <p className="text-center text-gray-400 mt-6 text-sm">
                  {objectsForPicker.length === 0 ? 'No tienes objetos disponibles.' : 'No hay objetos con esos filtros.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {objectsFiltered.map(obj => {
                    const objRareza = normalizeRareza(obj.Rareza);
                    return (
                      <button
                        key={obj.idCartaObjeto}
                        onClick={() => handleObjectSelected(obj)}
                        className={`text-left rounded-xl border-2 p-3 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer ${
                          OBJETO_RAREZA_COLORS[objRareza] ?? 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-semibold text-sm text-gray-900 leading-tight">{obj.NombreObjeto}</span>
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ${
                            RAREZA_BADGE[objRareza] ?? 'bg-gray-100 text-gray-500 border-gray-300'
                          }`}>
                            {objRareza}
                          </span>
                        </div>
                        {obj.DescripcionObjeto && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{obj.DescripcionObjeto}</p>
                        )}
                        {obj.EfectoObjeto && obj.ValorEfecto != null && (
                          <p className="text-xs text-green-700 font-semibold mt-1.5">
                            {obj.EfectoObjeto === 'multiplicador'
                              ? `+${Math.round((obj.ValorEfecto - 1) * 100)}% en ${obj.EstadisticaObjeto ?? 'puntos'}`
                              : `+${obj.ValorEfecto} pts por ${obj.EstadisticaObjeto ?? 'estadística'}`}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <button
                onClick={() => setSlotPickerIdx(null)}
                className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSelectionModal;
