// app/mi-equipo/page.tsx
'use client';

import { useAuth } from '@/context/auth-context';
import RequireAuth from '@/components/RequireAuth';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PlayerCard from '@/components/playerCard';
import PlayerSelectionModal from '@/components/PlayerSelectionModal';
import ObjectSelectionModal from '@/components/ObjectSelectionModal';
import { useRouter } from 'next/navigation';

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

  const [cartasJugadorManagerDB, setCartasJugadorManagerDB] = useState<CartaJugadorManager[]>([]);
  const [cartasObjetoManagerDB, setCartasObjetoManagerDB] = useState<CartaObjetoManager[]>([]);

  const [plantillaActual, setPlantillaActual] = useState<Map<number, CartaJugadorEnPlantilla>>(new Map());

  const [isPlayerSelectionModalOpen, setIsPlayerSelectionModalOpen] = useState(false);
  const [selectedPositionForModal, setSelectedPositionForModal] = useState<PosicionFrontend | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const [isObjectSelectionModalOpen, setIsObjectSelectionModalOpen] = useState(false);
  const [playerForObjectSelection, setPlayerForObjectSelection] = useState<CartaJugadorEnPlantilla | null>(null);
  const [playerIndexForObjectSelection, setPlayerIndexForObjectSelection] = useState<number | null>(null);

  const [selectedFormationLabel, setSelectedFormationLabel] = useState<string>(FORMACIONES[0].label);

  const [idJornadaActual, setIdJornadaActual] = useState<number | null>(null);

  const [jornadasDisponibles, setJornadasDisponibles] = useState<number[]>([]);
  const [selectedJornada, setSelectedJornada] = useState<number | null>(null);

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

  useEffect(() => {
    const fetchPlantilla = async () => {
      if (!manager || selectedJornada === null) return;
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
            map.set(jug.posicionEnPlantilla, {
              ...jug,
              objetosEquipados: jug.objetosEquipados || [],
              maxObjetosSlots: obtenerSlotsObjetoPorRareza(
                jug.Rareza as 'Común' | 'Raro' | 'Épico' | 'Legendario'
              ),
            });
          }
        });
        if (data.plantilla && data.plantilla.Alineacion) {
          setSelectedFormationLabel(data.plantilla.Alineacion);
        }
        setPlantillaActual(map);
      } catch (err) {
        console.error('Error al cargar plantilla:', err);
      }
    };

    fetchPlantilla();
  }, [manager, selectedJornada]);

  const handleOpenPlayerSelectionModal = useCallback((
    posicion: PosicionFrontend,
    slotIndex: number
  ) => {
    setSelectedPositionForModal(posicion);
    setSelectedSlotIndex(slotIndex);
    setIsPlayerSelectionModalOpen(true);
  }, []);

  const handleClosePlayerSelectionModal = useCallback(() => {
    setIsPlayerSelectionModalOpen(false);
    setSelectedPositionForModal(null);
    setSelectedSlotIndex(null);
  }, []);

  // Modificado para manejar la opción de "vaciar slot" y con logs de depuración
  const handlePlayerSelected = useCallback((selectedPlayer: CartaJugadorManager | null) => {
    console.log("--- handlePlayerSelected llamado ---");
    console.log("selectedPlayer recibido:", selectedPlayer ? selectedPlayer.NombreJugador : "null (vaciar slot)");
    console.log("selectedSlotIndex actual:", selectedSlotIndex);
    console.log("selectedPositionForModal actual:", selectedPositionForModal);

    if (selectedSlotIndex === null || selectedPositionForModal === null) {
      console.error("ERROR: No se pudo seleccionar/vaciar el jugador: slot o posición no definidos.");
      return;
    }

    const newPlantilla = new Map(plantillaActual); // Clonar el mapa actual
    console.log("Tamaño de plantillaActual ANTES de la actualización:", plantillaActual.size);

    if (selectedPlayer === null) {
      // Si selectedPlayer es null, vaciar el slot
      newPlantilla.delete(selectedSlotIndex);
      console.log(`Slot ${selectedSlotIndex} marcado para vaciar.`);
    } else {
      // Si se selecciona un jugador, añadirlo/reemplazarlo
      const playerInPlantilla: CartaJugadorEnPlantilla = {
        idCartaJugador: selectedPlayer.idCartaJugador,
        idJugador: selectedPlayer.Jugador_idJugadorDB,
        Nombre: selectedPlayer.NombreJugador,
        Posicion: selectedPlayer.PosicionJugadorDB,
        PosicionFrontend: getPosicionFrontend(selectedPlayer.PosicionJugadorDB),
        Rareza: selectedPlayer.Rareza as "Común" | "Raro" | "Épico" | "Legendario",
        Puntos: selectedPlayer.Puntos,
        Edad: selectedPlayer.Edad,
        Pais: selectedPlayer.Pais,
        Precio: selectedPlayer.Precio,
        NombreEquipo: selectedPlayer.NombreEquipo,
        objetosEquipados: [],
        maxObjetosSlots: obtenerSlotsObjetoPorRareza(selectedPlayer.Rareza as "Común" | "Raro" | "Épico" | "Legendario"),
        posicionEnPlantilla: selectedSlotIndex,
      };

      // Asegurarse de que el jugador no esté ya en otro slot
      let jugadorExistenteEnOtroSlot = false;
      plantillaActual.forEach((player, index) => { // Iterar sobre el MAPA ORIGINAL
        if (player.idCartaJugador === playerInPlantilla.idCartaJugador && index !== selectedSlotIndex) {
          newPlantilla.delete(index); // Eliminar del NUEVO MAPA
          console.log(`Jugador "${player.Nombre}" (ID: ${player.idCartaJugador}) movido del slot ${index} al ${selectedSlotIndex}.`);
          jugadorExistenteEnOtroSlot = true;
        }
      });
      if (!jugadorExistenteEnOtroSlot) {
        console.log(`Jugador "${playerInPlantilla.Nombre}" (ID: ${playerInPlantilla.idCartaJugador}) es nuevo en el slot ${selectedSlotIndex}.`);
      }

      newPlantilla.set(selectedSlotIndex, playerInPlantilla); // Añadir/actualizar en el NUEVO MAPA
      console.log(`Jugador "${playerInPlantilla.Nombre}" establecido en el slot ${selectedSlotIndex}.`);
    }

    setPlantillaActual(newPlantilla); // Actualizar el estado con el nuevo mapa
    console.log("Tamaño de newPlantilla DESPUÉS de la actualización:", newPlantilla.size);
    console.log("Contenido de newPlantilla (después de setPlantillaActual):", Array.from(newPlantilla.entries()));
    console.log("--- Fin handlePlayerSelected ---");
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
      alert("No hay un manager autenticado.");
      return;
    }

    if (!currentFormation) {
      alert("Selecciona una alineación válida antes de guardar.");
      return;
    }

    if (selectedJornada === null || idJornadaActual === null) {
      alert("No se pudo obtener la jornada actual. Inténtalo de nuevo.");
      return;
    }

    if (!isEditingAllowed) {
      alert("Solo se puede editar la jornada actual.");
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
        throw new Error(`Error al guardar la plantilla: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log("Plantilla guardada exitosamente:", result);
      alert("¡Plantilla guardada exitosamente!");
    } catch (error: any) {
      console.error("Error al guardar la plantilla:", error.message);
      setError(`Error al guardar la plantilla: ${error.message}`);
      alert(`Hubo un error al intentar guardar la plantilla: ${error.message}.`);
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
                        className="relative w-28 h-40 border border-gray-600 rounded-lg flex flex-col items-center justify-center m-1 p-1 bg-gray-700 text-white shadow-md"
                    >
                        {currentPlayer ? (
                            <PlayerCard
                                carta={currentPlayer}
                                onClick={isEditingAllowed ? () =>
                                    handleOpenPlayerSelectionModal(posicionFrontend, currentIndex)
                                : undefined}
                                onEquipObject={isEditingAllowed ? () => {
                                    handleOpenObjectSelectionModal(currentPlayer, currentIndex);
                                } : undefined}
                            />
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-lg mb-2">Vacío ({posicionFrontend})</span>
                                {isEditingAllowed && (
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                                    onClick={() =>
                                        handleOpenPlayerSelectionModal(posicionFrontend, currentIndex)
                                    }
                                >
                                    + Seleccionar
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
    }, [plantillaActual, currentFormation, handleOpenPlayerSelectionModal, handleOpenObjectSelectionModal, isEditingAllowed]);
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

          <div className="text-lg mb-4 text-center">
            Jugadores en plantilla: {plantillaActual.size} / {totalSlots}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {renderPlantillaSlots}
          </div>
        </div>

        {/* Modal de Selección de Jugador */}
        {isPlayerSelectionModalOpen && selectedPositionForModal && selectedSlotIndex !== null && (
          <PlayerSelectionModal
            position={selectedPositionForModal}
            availablePlayers={availablePlayersForSelection}
            onClose={handleClosePlayerSelectionModal}
            onPlayerSelected={handlePlayerSelected}
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