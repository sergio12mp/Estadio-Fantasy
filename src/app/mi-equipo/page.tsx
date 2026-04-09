// app/mi-equipo/page.tsx
'use client';

import { useAuth } from '@/context/auth-context';
import RequireAuth from '@/components/RequireAuth';
import React, { useState, useEffect, useMemo, useCallback } from 'react';

const COSTE_BASE_FE: Record<string, number> = {
  'Común': 1, 'Comun': 1,
  'Raro': 2, 'Rara': 2,
  'Épico': 3, 'Epico': 3, 'Épica': 3, 'Epica': 3,
  'Legendario': 4, 'Legendaria': 4,
};

const RAREZA_MAP: Record<string, 'Común' | 'Raro' | 'Épico' | 'Legendario'> = {
  'comun': 'Común', 'común': 'Común',
  'raro': 'Raro', 'rara': 'Raro',
  'epico': 'Épico', 'epica': 'Épico', 'épico': 'Épico', 'épica': 'Épico',
  'legendario': 'Legendario', 'legendaria': 'Legendario',
};

function normalizeRareza(r: string): 'Común' | 'Raro' | 'Épico' | 'Legendario' {
  if (!r) return 'Común';
  const key = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return RAREZA_MAP[key] ?? 'Común';
}
import PlayerCard from '@/components/playerCard';
import PlayerSelectionModal from '@/components/playerSelectionModal';
import ObjectSelectionModal from '@/components/objectSelectionModal';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

// Asegúrate de que estas interfaces y funciones estén en '@/lib/data'
import {
  CartaJugadorManager,
  CartaObjetoManager,
  CartaJugadorEnPlantilla,
  ObjetoEquipado,
  getPosicionFrontend,
  PosicionFrontend,
  obtenerSlotsObjetoPorRareza,
  PosicionDB,
} from '@/lib/data';

// --- NUEVAS INTERFACES PARA LA FORMACIÓN ---
interface Formacion {
  label: string;
  positions: { [key in PosicionFrontend]: number };
  order: PosicionFrontend[];
}

// --- DEFINICIONES DE FORMACIONES (pueden venir de DB a futuro) ---
const FORMACIONES: Formacion[] = [
  {
    label: '5-4-1',
    positions: { 'POR': 1, 'DEF': 5, 'MED': 4, 'DEL': 1 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '5-3-2',
    positions: { 'POR': 1, 'DEF': 5, 'MED': 3, 'DEL': 2 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '4-5-1',
    positions: { 'POR': 1, 'DEF': 4, 'MED': 5, 'DEL': 1 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '4-4-2',
    positions: { 'POR': 1, 'DEF': 4, 'MED': 4, 'DEL': 2 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '4-3-3',
    positions: { 'POR': 1, 'DEF': 4, 'MED': 3, 'DEL': 3 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '3-5-2',
    positions: { 'POR': 1, 'DEF': 3, 'MED': 5, 'DEL': 2 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
  {
    label: '3-4-3',
    positions: { 'POR': 1, 'DEF': 3, 'MED': 4, 'DEL': 3 },
    order: ['POR', 'DEF', 'MED', 'DEL'],
  },
];

export default function MiEquipo() {
  const { manager, loading: authLoading } = useAuth();
  const router = useRouter();

  // TODOS LOS HOOKS (useState, useEffect, useMemo, useCallback) DEBEN IR AQUÍ, AL PRINCIPIO
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [cartasJugadorManagerDB, setCartasJugadorManagerDB] = useState<CartaJugadorManager[]>([]);
  const [cartasObjetoManagerDB, setCartasObjetoManagerDB] = useState<CartaObjetoManager[]>([]);

  const [plantillaActual, setPlantillaActual] = useState<Map<number, CartaJugadorEnPlantilla>>(new Map());

  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] = useState(false);
  const [selectedPositionForModal, setSelectedPositionForModal] = useState<PosicionFrontend | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const [isObjectSelectionModalOpen, setIsObjectSelectionModalOpen] = useState(false);
  const [playerForObjectSelection, setPlayerForObjectSelection] = useState<CartaJugadorEnPlantilla | null>(null);
  const [playerIndexForObjectSelection, setPlayerIndexForObjectSelection] = useState<number | null>(null);

  const [modalInitialPlayer, setModalInitialPlayer] = useState<CartaJugadorManager | null>(null);
  const [modalInitialObjects, setModalInitialObjects] = useState<CartaObjetoManager[]>([]);

  const [selectedFormationLabel, setSelectedFormationLabel] = useState<string>(FORMACIONES[0].label);

  const [idJornadaActual, setIdJornadaActual] = useState<number | null>(null);
  const [puntosJornada, setPuntosJornada] = useState<number | null>(null);

  const [jornadasDisponibles, setJornadasDisponibles] = useState<number[]>([]);
  const [selectedJornada, setSelectedJornada] = useState<number | null>(null);

  const [costes, setCostes] = useState<Record<number, { costeBase: number; incremento: number; costeTotal: number }>>({});
  const [limiteUso, setLimiteUso] = useState(100);
  const [limiteClub, setLimiteClub] = useState(4);

  const isEditingAllowed =
    selectedJornada !== null && selectedJornada === idJornadaActual;

  const currentFormation = useMemo(() => {
    return FORMACIONES.find(f => f.label === selectedFormationLabel);
  }, [selectedFormationLabel]);

  const totalSlots = useMemo(() => {
    if (!currentFormation) return 0;
    return Object.values(currentFormation.positions).reduce((sum, count) => sum + count, 0);
  }, [currentFormation]);

  // Effect para cargar datos del manager y la jornada al montar el componente o cuando el manager cambia
  useEffect(() => {
    const fetchManagerData = async () => {
      setIsLoading(true);
      setError(null);
      if (!manager) {
        setError("Manager no encontrado o no autenticado.");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Obtener cartas de jugador del manager
        console.log(`Fetching player cards for manager: ${manager.idManager}`);
        const playerRes = await fetch(`/api/cartas-manager?managerId=${manager.idManager}`);
        const playerData = await playerRes.json();
        if (!playerRes.ok) {
          throw new Error(`Error al obtener cartas de jugador: ${playerData.error || playerRes.statusText}`);
        }
        console.log("Player data fetched:", playerData);
        setCartasJugadorManagerDB(playerData.cartasJugador || []);

        // 2. Obtener objetos del manager
        console.log(`Fetching object cards for manager: ${manager.idManager}`);
        const objectRes = await fetch(`/api/cartas-manager/objetos?managerId=${manager.idManager}`);
        const objectData = await objectRes.json();
        if (!objectRes.ok) {
          throw new Error(`Error al obtener objetos: ${objectData.error || objectRes.statusText}`);
        }
        console.log("Object data fetched:", objectData);
        setCartasObjetoManagerDB(objectData.cartasObjeto || []);

        // 3. Obtener la última jornada
        const jornadaRes = await fetch('/api/jornada/ultima');
        const jornadaData = await jornadaRes.json();
        if (!jornadaRes.ok) {
          throw new Error(`Error al obtener la última jornada: ${jornadaData.error || jornadaRes.statusText}`);
        }
        console.log("Last jornada fetched:", jornadaData);
        setIdJornadaActual(jornadaData.idJornada);

      } catch (err: any) {
        console.error("❌ Error al cargar datos del manager o plantilla:", err.message);
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (manager) {
      fetchManagerData();
    }
  }, [manager]);

  useEffect(() => {
    const fetchJornadas = async () => {
      if (idJornadaActual === null) return;
      try {
        const res = await fetch('/api/jornada');
        const data = await res.json();
        if (res.ok && Array.isArray(data.result)) {
          const ids = data.result
            .map((j: any) => j.idJornada)
            .filter((id: number) => id <= idJornadaActual)
            .sort((a: number, b: number) => a - b);
          setJornadasDisponibles(ids);
          setSelectedJornada((prev) => prev ?? idJornadaActual);
        }
      } catch (err) {
        console.error('Error al obtener jornadas:', err);
      }
    };

    fetchJornadas();
  }, [idJornadaActual]);

  // Recargar cartas con puntos de la jornada seleccionada
  useEffect(() => {
    if (!manager || selectedJornada === null) return;
    fetch(`/api/cartas-manager?managerId=${manager.idManager}&idJornada=${selectedJornada}`)
      .then(r => r.json())
      .then(data => { if (data.cartasJugador) setCartasJugadorManagerDB(data.cartasJugador); })
      .catch(console.error);
  }, [manager, selectedJornada]);

  useEffect(() => {
    const fetchPlantilla = async () => {
      if (!manager || selectedJornada === null) return;
      setPuntosJornada(null);
      try {
        const resp = await fetch(
          `/api/plantilla?managerId=${manager.idManager}&idJornada=${selectedJornada}`
        );
        if (!resp.ok) {
          setPlantillaActual(new Map());
          return;
        }
        const data = await resp.json();
        const jugadores = Array.isArray(data.jugadoresEnCampo)
          ? data.jugadoresEnCampo
          : [];
        const map = new Map<number, CartaJugadorEnPlantilla>();
        jugadores.forEach((jug: any) => {
          if (jug) {
            const rarezaNorm = normalizeRareza(jug.Rareza ?? '');
            map.set(jug.posicionEnPlantilla, {
              ...jug,
              Rareza: rarezaNorm,
              Edad: jug.Edad?.split('-')[0] ?? jug.Edad ?? '',
              objetosEquipados: jug.objetosEquipados || [],
              maxObjetosSlots: obtenerSlotsObjetoPorRareza(rarezaNorm),
            });
          }
        });
        if (data.plantilla && data.plantilla.Alineacion) {
          setSelectedFormationLabel(data.plantilla.Alineacion);
        }
        setPuntosJornada(data.plantilla?.Puntos ?? null);
        setPlantillaActual(map);
      } catch (err) {
        console.error('Error al cargar plantilla:', err);
      }
    };

    fetchPlantilla();
  }, [manager, selectedJornada]);

  // Cargar costes de uso cuando cambia la jornada
  useEffect(() => {
    if (selectedJornada === null) return;
    fetch(`/api/plantilla/uso?idJornada=${selectedJornada}`)
      .then(r => r.json())
      .then(data => {
        setCostes(data.costes ?? {});
        setLimiteUso(data.limiteUso ?? 100);
        setLimiteClub(data.limiteClub ?? 4);
      })
      .catch(console.error);
  }, [selectedJornada]);

  // Uso total de la plantilla actual
  const usoTotal = useMemo(() => {
    let total = 0;
    plantillaActual.forEach(player => {
      const info = costes[player.idJugador];
      total += info?.costeTotal ?? (COSTE_BASE_FE[player.Rareza] ?? 1);
      for (const obj of player.objetosEquipados) {
        total += COSTE_BASE_FE[obj.Rareza] ?? 1;
      }
    });
    return total;
  }, [plantillaActual, costes]);

  const handleOpenPlayerSelectionModal = useCallback((
    posicion: PosicionFrontend,
    slotIndex: number
  ) => {
    setModalInitialPlayer(null);
    setModalInitialObjects([]);
    setSelectedPositionForModal(posicion);
    setSelectedSlotIndex(slotIndex);
    setIsPlayerSelectionModalOpen(true);
  }, []);

  const handleReconfigurePlayer = useCallback((
    player: CartaJugadorEnPlantilla,
    slotIndex: number,
    posicion: PosicionFrontend
  ) => {
    const matchingCarta = cartasJugadorManagerDB.find(c => c.idCartaJugador === player.idCartaJugador) ?? null;
    const initObjs = player.objetosEquipados
      .map(oe => cartasObjetoManagerDB.find(c => c.idCartaObjeto === oe.idCartaObjeto))
      .filter(Boolean) as CartaObjetoManager[];
    setModalInitialPlayer(matchingCarta);
    setModalInitialObjects(initObjs);
    setSelectedPositionForModal(posicion);
    setSelectedSlotIndex(slotIndex);
    setIsPlayerSelectionModalOpen(true);
  }, [cartasJugadorManagerDB, cartasObjetoManagerDB]);

  const handleClosePlayerSelectionModal = useCallback(() => {
    setIsPlayerSelectionModalOpen(false);
    setSelectedPositionForModal(null);
    setSelectedSlotIndex(null);
  }, []);

  const handlePlayerSelected = useCallback((
    selectedPlayer: CartaJugadorManager | null,
    selectedObjects: CartaObjetoManager[] = []
  ) => {
    if (selectedSlotIndex === null || selectedPositionForModal === null) return;

    const newPlantilla = new Map(plantillaActual);

    if (selectedPlayer === null) {
      newPlantilla.delete(selectedSlotIndex);
    } else {
      const rarezaNorm = normalizeRareza(selectedPlayer.Rareza);
      const objetosEquipados = selectedObjects.map(o => ({
        idCartaObjeto: o.idCartaObjeto,
        Nombre: o.NombreObjeto,
        Rareza: o.Rareza,
        Efecto: o.EfectoObjeto,
        ValorEfecto: o.ValorEfecto,
      }));

      const playerInPlantilla: CartaJugadorEnPlantilla = {
        idCartaJugador: selectedPlayer.idCartaJugador,
        idJugador: selectedPlayer.Jugador_idJugadorDB,
        Nombre: selectedPlayer.NombreJugador,
        Posicion: selectedPlayer.PosicionJugadorDB,
        PosicionFrontend: getPosicionFrontend(selectedPlayer.PosicionJugadorDB),
        Rareza: rarezaNorm,
        Puntos: selectedPlayer.Puntos,
        Edad: selectedPlayer.Edad?.split('-')[0] ?? '',
        Pais: selectedPlayer.Pais,
        Precio: selectedPlayer.Precio,
        NombreEquipo: selectedPlayer.NombreEquipo,
        objetosEquipados,
        maxObjetosSlots: obtenerSlotsObjetoPorRareza(rarezaNorm),
        posicionEnPlantilla: selectedSlotIndex,
      };

      // Remove from another slot if already placed
      plantillaActual.forEach((player, index) => {
        if (player.idCartaJugador === playerInPlantilla.idCartaJugador && index !== selectedSlotIndex) {
          newPlantilla.delete(index);
        }
      });

      newPlantilla.set(selectedSlotIndex, playerInPlantilla);
    }

    setPlantillaActual(newPlantilla);
    handleClosePlayerSelectionModal();
  }, [plantillaActual, selectedSlotIndex, selectedPositionForModal, handleClosePlayerSelectionModal]);


  const availablePlayersForSelection = useMemo(() => {
    const jugadoresEnPlantillaIds = new Set(Array.from(plantillaActual.values()).map(p => p.idCartaJugador));
    return cartasJugadorManagerDB.filter(player => !jugadoresEnPlantillaIds.has(player.idCartaJugador));
  }, [cartasJugadorManagerDB, plantillaActual]);

  const handleRemovePlayer = useCallback((slotIndex: number) => {
    const newPlantilla = new Map(plantillaActual);
    newPlantilla.delete(slotIndex);
    setPlantillaActual(newPlantilla);
  }, [plantillaActual]);

  const handleOpenObjectSelectionModal = useCallback((player: CartaJugadorEnPlantilla, index: number) => {
    setPlayerForObjectSelection(player);
    setPlayerIndexForObjectSelection(index);
    setIsObjectSelectionModalOpen(true);
  }, []);

  const handleCloseObjectSelectionModal = useCallback(() => {
    setIsObjectSelectionModalOpen(false);
    setPlayerForObjectSelection(null);
    setPlayerIndexForObjectSelection(null);
  }, []);

  const handleConfirmEquipObjects = useCallback((
    playerId: number,
    updatedEquippedObjects: ObjetoEquipado[]
  ) => {
    const newPlantilla = new Map(plantillaActual);
    let found = false;
    newPlantilla.forEach((player, index) => {
      if (player.idCartaJugador === playerId) {
        newPlantilla.set(index, { ...player, objetosEquipados: updatedEquippedObjects });
        found = true;
      }
    });

    if (!found) {
      console.warn(`Jugador con idCartaJugador ${playerId} no encontrado en la plantilla para actualizar objetos.`);
    }
    setPlantillaActual(newPlantilla);
    handleCloseObjectSelectionModal();
  }, [plantillaActual, handleCloseObjectSelectionModal]);

  const handleGuardarPlantilla = async () => {
    if (!manager) {
      setToast({ message: "No hay un manager autenticado.", type: 'error' });
      return;
    }

    if (!currentFormation) {
      setToast({ message: "Selecciona una alineación válida antes de guardar.", type: 'error' });
      return;
    }

    if (selectedJornada === null || idJornadaActual === null) {
      setToast({ message: "No se pudo obtener la jornada actual. Inténtalo de nuevo.", type: 'error' });
      return;
    }

    if (!isEditingAllowed) {
      setToast({ message: "Solo se puede editar la jornada actual.", type: 'error' });
      return;
    }

    try {
      const plantillaParaGuardar = Array.from(plantillaActual.values()).map(player => ({
        idCartaJugador: player.idCartaJugador,
        posicionEnPlantilla: player.posicionEnPlantilla,
        objetosEquipados: player.objetosEquipados.map(obj => obj.idCartaObjeto),
      }));

      console.log("Enviando plantilla para guardar:", {
        managerId: manager.idManager,
        jugadoresParaGuardar: plantillaParaGuardar,
        alineacionLabel: selectedFormationLabel,
        idJornada: selectedJornada,
      });

      const response = await fetch('/api/plantilla', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          managerId: manager.idManager,
          jugadoresParaGuardar: plantillaParaGuardar,
          alineacionLabel: selectedFormationLabel,
          idJornada: selectedJornada,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // 422 = validación de límites (mensaje directo del servidor)
        const msg = errorData.error || response.statusText;
        setToast({ message: msg, type: 'error' });
        return;
      }

      const result = await response.json();
      console.log("Plantilla guardada exitosamente:", result);
      setToast({ message: "¡Plantilla guardada correctamente!", type: 'success' });
    } catch (error: any) {
      console.error("Error al guardar la plantilla:", error.message);
      setError(`Error al guardar la plantilla: ${error.message}`);
      setToast({ message: `Error al guardar: ${error.message}`, type: 'error' });
    }
  };

  // Genera los slots vacíos y ocupados para la visualización de la plantilla
  //Genera los slots de la plantilla según la formación seleccionada
  const renderPlantillaSlots = useMemo(() => {
        if (!currentFormation) {
            return [];
        }

        const rows: JSX.Element[] = [];
        let globalIndex = 0;

        currentFormation.order.forEach((posicionFrontend) => {
            const count = currentFormation.positions[posicionFrontend];
            const rowSlots: JSX.Element[] = [];

            for (let i = 0; i < count; i++) {
                const currentIndex = globalIndex;
                const currentPlayer = plantillaActual.get(currentIndex);
                rowSlots.push(
                    <div
                        key={currentIndex}
                        className="relative w-44 rounded-xl flex flex-col items-center justify-start m-1 p-1 text-white shadow-md border border-white/10"
                    >
                        {currentPlayer ? (
                            <>
                            <PlayerCard
                                carta={currentPlayer}
                                fieldMode
                                onClick={isEditingAllowed ? () =>
                                    handleReconfigurePlayer(currentPlayer, currentIndex, posicionFrontend)
                                : undefined}
                                onEquipObject={() => {
                                    handleOpenObjectSelectionModal(currentPlayer, currentIndex);
                                }}
                            />
                            <div className="mt-0.5 text-[10px] text-white/70 text-center">
                              Uso: {costes[currentPlayer.idJugador]?.costeTotal ?? (COSTE_BASE_FE[currentPlayer.Rareza] ?? 1)}
                            </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-1 py-2">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold">
                                    {posicionFrontend}
                                </div>
                                {isEditingAllowed && (
                                <button
                                    className="px-3 py-1.5 bg-green-500/80 text-white text-xs rounded-lg hover:bg-green-500 focus:outline-none transition-colors"
                                    onClick={() =>
                                        handleOpenPlayerSelectionModal(posicionFrontend, currentIndex)
                                    }
                                >
                                    + Añadir
                                </button>
                                )}
                            </div>
                        )}
                    </div>
                );
                globalIndex++;
            }

            rows.push(
                <div key={`row-${posicionFrontend}-${globalIndex}`} className="flex justify-center mb-4">
                    {rowSlots}
                </div>
            );
        });

        return rows;
    }, [plantillaActual, currentFormation, handleReconfigurePlayer, handleOpenObjectSelectionModal, isEditingAllowed, costes]);
  // ESTOS RETURNS CONDICIONALES DEBEN IR DESPUÉS DE LA DEFINICIÓN DE TODOS LOS HOOKS.
  if (authLoading || isLoading) {
    return <div className="text-center text-white text-xl mt-8">Cargando equipo...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl mt-8">Error: {error}</div>;
  }

  if (!manager) {
    return <div className="flex flex-col items-center">Por favor, inicia sesión para ver tu equipo.</div>;
  }


  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold text-center mb-6">Mi Equipo</h1>

        <div className="max-w-7xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
          <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row items-center space-x-4 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <label htmlFor="alineacion-select" className="text-lg">Alineación:</label>
                <select
                  id="alineacion-select"
                  className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  value={selectedFormationLabel}
                  onChange={(e) => setSelectedFormationLabel(e.target.value)}
                >
                  {FORMACIONES.map((formacion) => (
                    <option key={formacion.label} value={formacion.label}>
                      {formacion.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="jornada-select" className="text-lg">Jornada:</label>
                <select
                  id="jornada-select"
                  className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                  value={selectedJornada ?? ''}
                  onChange={(e) => setSelectedJornada(parseInt(e.target.value))}
                >
                  {jornadasDisponibles.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleGuardarPlantilla}
              disabled={!isEditingAllowed}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-200 ${!isEditingAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Guardar Plantilla
            </button>
          </div>

          <div className="text-lg mb-4 text-center flex justify-center gap-8 flex-wrap">
            <span>Jugadores en plantilla: {plantillaActual.size} / {totalSlots}</span>
            <span className={usoTotal > limiteUso ? 'text-red-400 font-bold' : usoTotal > limiteUso * 0.85 ? 'text-yellow-400 font-bold' : 'text-green-400 font-bold'}>
              Uso: {usoTotal} / {limiteUso}
            </span>
            {puntosJornada != null && (
              <span className="text-yellow-400 font-bold">
                Puntos jornada {selectedJornada}: {puntosJornada}
              </span>
            )}
          </div>
          {usoTotal > limiteUso && (
            <div className="mb-4 p-3 bg-red-900/60 border border-red-500 rounded-lg text-center text-red-300 text-sm font-medium">
              El uso total ({usoTotal}) supera el límite de {limiteUso}. Reduce jugadores o cambia cartas por otras de menor rareza.
            </div>
          )}

          {/* Campo de fútbol */}
          <div className="relative rounded-2xl overflow-hidden border-4 border-green-600/40"
            style={{
              background: 'repeating-linear-gradient(to bottom, #166534, #166534 60px, #15803d 60px, #15803d 120px)',
            }}
          >
            {/* Línea central */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/20" />
            <div className="py-6 px-4">
              {renderPlantillaSlots}
            </div>
          </div>
        </div>

        {toast && (
          <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        )}

        {/* Modal de Selección de Jugador */}
        {isPlayerSelectionModalOpen && selectedPositionForModal && selectedSlotIndex !== null && (
          <PlayerSelectionModal
            position={selectedPositionForModal}
            availablePlayers={availablePlayersForSelection}
            availableObjects={cartasObjetoManagerDB}
            onClose={handleClosePlayerSelectionModal}
            onConfirm={handlePlayerSelected}
            initialPlayer={modalInitialPlayer}
            initialObjects={modalInitialObjects}
          />
        )}

        {/* Modal de Selección de Objeto */}
        {isObjectSelectionModalOpen && playerForObjectSelection && playerIndexForObjectSelection !== null && (
          <ObjectSelectionModal
            jugador={playerForObjectSelection}
            availableObjects={cartasObjetoManagerDB}
            onClose={handleCloseObjectSelectionModal}
            onConfirmEquip={handleConfirmEquipObjects}
          />
        )}
      </div>
    </RequireAuth>
  );
}