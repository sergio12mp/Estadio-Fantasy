'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import {
    CartaJugadorManager,
    CartaObjetoManager,
    CartaJugadorEnPlantilla,
    ObjetoEquipado,
    getPosicionFrontend,
    PosicionFrontend,
    obtenerSlotsObjetoPorRareza,
} from '@/lib/data';
import { FORMACIONES } from '@/lib/formations';
import { normalizeRareza } from '@/lib/rareza-utils';
import { COSTE_BASE_USO, TEAM_LIMITS_DEFAULT } from '@/lib/constants';

type Toast = { message: string; type: 'success' | 'error' | 'info' };

export function useMiEquipo() {
    const { manager, loading: authLoading } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);

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
    const [limiteUso, setLimiteUso] = useState(TEAM_LIMITS_DEFAULT.LIMITE_USO);
    const [limiteClub, setLimiteClub] = useState(TEAM_LIMITS_DEFAULT.MAX_JUGADORES_POR_CLUB);

    const isEditingAllowed = selectedJornada !== null && selectedJornada === idJornadaActual;

    const currentFormation = useMemo(() => {
        return FORMACIONES.find(f => f.label === selectedFormationLabel);
    }, [selectedFormationLabel]);

    const totalSlots = useMemo(() => {
        if (!currentFormation) return 0;
        return Object.values(currentFormation.positions).reduce((sum, count) => sum + count, 0);
    }, [currentFormation]);

    // Cargar cartas y última jornada al montar o cuando cambia el manager
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
                const playerRes = await fetch(`/api/cartas-manager?managerId=${manager.idManager}`);
                const playerData = await playerRes.json();
                if (!playerRes.ok) throw new Error(`Error al obtener cartas de jugador: ${playerData.error || playerRes.statusText}`);
                setCartasJugadorManagerDB(playerData.cartasJugador || []);

                const objectRes = await fetch(`/api/cartas-manager/objetos?managerId=${manager.idManager}`);
                const objectData = await objectRes.json();
                if (!objectRes.ok) throw new Error(`Error al obtener objetos: ${objectData.error || objectRes.statusText}`);
                setCartasObjetoManagerDB(objectData.cartasObjeto || []);

                const jornadaRes = await fetch('/api/jornada/ultima');
                const jornadaData = await jornadaRes.json();
                if (!jornadaRes.ok) throw new Error(`Error al obtener la última jornada: ${jornadaData.error || jornadaRes.statusText}`);
                setIdJornadaActual(jornadaData.idJornada);
            } catch (err: any) {
                console.error("❌ Error al cargar datos del manager o plantilla:", err.message);
                setError(`Error al cargar datos: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        if (manager) fetchManagerData();
    }, [manager]);

    // Cargar lista de jornadas disponibles
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

    // Recargar cartas con puntos al cambiar de jornada
    useEffect(() => {
        if (!manager || selectedJornada === null) return;
        fetch(`/api/cartas-manager?managerId=${manager.idManager}&idJornada=${selectedJornada}`)
            .then(r => r.json())
            .then(data => { if (data.cartasJugador) setCartasJugadorManagerDB(data.cartasJugador); })
            .catch(console.error);
    }, [manager, selectedJornada]);

    // Cargar plantilla de la jornada seleccionada
    useEffect(() => {
        const fetchPlantilla = async () => {
            if (!manager || selectedJornada === null) return;
            setPuntosJornada(null);
            try {
                const resp = await fetch(`/api/plantilla?managerId=${manager.idManager}&idJornada=${selectedJornada}`);
                if (!resp.ok) { setPlantillaActual(new Map()); return; }
                const data = await resp.json();
                const jugadores = Array.isArray(data.jugadoresEnCampo) ? data.jugadoresEnCampo : [];
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
                if (data.plantilla?.Alineacion) setSelectedFormationLabel(data.plantilla.Alineacion);
                setPuntosJornada(data.plantilla?.Puntos ?? null);
                setPlantillaActual(map);
            } catch (err) {
                console.error('Error al cargar plantilla:', err);
            }
        };
        fetchPlantilla();
    }, [manager, selectedJornada]);

    // Cargar costes de uso al cambiar de jornada
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

    const usoTotal = useMemo(() => {
        let total = 0;
        plantillaActual.forEach(player => {
            const info = costes[player.idJugador];
            total += info?.costeTotal ?? (COSTE_BASE_USO[player.Rareza] ?? 1);
            for (const obj of player.objetosEquipados) {
                total += COSTE_BASE_USO[obj.Rareza] ?? 1;
            }
        });
        return total;
    }, [plantillaActual, costes]);

    const handleOpenPlayerSelectionModal = useCallback((posicion: PosicionFrontend, slotIndex: number) => {
        setModalInitialPlayer(null);
        setModalInitialObjects([]);
        setSelectedPositionForModal(posicion);
        setSelectedSlotIndex(slotIndex);
        setIsPlayerSelectionModalOpen(true);
    }, []);

    const handleReconfigurePlayer = useCallback((player: CartaJugadorEnPlantilla, slotIndex: number, posicion: PosicionFrontend) => {
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
                slug: selectedPlayer.slug ?? null,
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
            // Quitar al jugador de otro slot si ya estaba colocado
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

    const handleConfirmEquipObjects = useCallback((playerId: number, updatedEquippedObjects: ObjetoEquipado[]) => {
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
        if (!manager) { setToast({ message: "No hay un manager autenticado.", type: 'error' }); return; }
        if (!currentFormation) { setToast({ message: "Selecciona una alineación válida antes de guardar.", type: 'error' }); return; }
        if (selectedJornada === null || idJornadaActual === null) { setToast({ message: "No se pudo obtener la jornada actual. Inténtalo de nuevo.", type: 'error' }); return; }
        if (!isEditingAllowed) { setToast({ message: "Solo se puede editar la jornada actual.", type: 'error' }); return; }

        try {
            const plantillaParaGuardar = Array.from(plantillaActual.values()).map(player => ({
                idCartaJugador: player.idCartaJugador,
                posicionEnPlantilla: player.posicionEnPlantilla,
                objetosEquipados: player.objetosEquipados.map(obj => obj.idCartaObjeto),
            }));

            const response = await fetch('/api/plantilla', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    managerId: manager.idManager,
                    jugadoresParaGuardar: plantillaParaGuardar,
                    alineacionLabel: selectedFormationLabel,
                    idJornada: selectedJornada,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const msg = errorData.error || response.statusText;
                setToast({ message: msg, type: 'error' });
                return;
            }

            await response.json();
            setToast({ message: "¡Plantilla guardada correctamente!", type: 'success' });
        } catch (error: any) {
            console.error("Error al guardar la plantilla:", error.message);
            setError(`Error al guardar la plantilla: ${error.message}`);
            setToast({ message: `Error al guardar: ${error.message}`, type: 'error' });
        }
    };

    return {
        manager,
        authLoading,
        isLoading,
        error,
        toast,
        setToast,
        cartasJugadorManagerDB,
        cartasObjetoManagerDB,
        plantillaActual,
        isPlayerSelectionModalOpen,
        selectedPositionForModal,
        selectedSlotIndex,
        isObjectSelectionModalOpen,
        playerForObjectSelection,
        playerIndexForObjectSelection,
        modalInitialPlayer,
        modalInitialObjects,
        selectedFormationLabel,
        setSelectedFormationLabel,
        idJornadaActual,
        puntosJornada,
        jornadasDisponibles,
        selectedJornada,
        setSelectedJornada,
        costes,
        limiteUso,
        limiteClub,
        isEditingAllowed,
        currentFormation,
        totalSlots,
        usoTotal,
        availablePlayersForSelection,
        handleOpenPlayerSelectionModal,
        handleReconfigurePlayer,
        handleClosePlayerSelectionModal,
        handlePlayerSelected,
        handleRemovePlayer,
        handleOpenObjectSelectionModal,
        handleCloseObjectSelectionModal,
        handleConfirmEquipObjects,
        handleGuardarPlantilla,
    };
}
