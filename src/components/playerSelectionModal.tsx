// components/PlayerSelectionModal.tsx
import React, { useMemo } from 'react';
import PlayerCard from './playerCard';
import { CartaJugadorManager, PosicionFrontend, obtenerSlotsObjetoPorRareza, getPosicionFrontend } from '@/lib/data';

interface PlayerSelectionModalProps {
  position: PosicionFrontend;
  availablePlayers: CartaJugadorManager[];
  onClose: () => void;
  // Modificado para aceptar null cuando se vacía el slot
  onPlayerSelected: (jugador: CartaJugadorManager | null) => void;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  position,
  availablePlayers,
  onClose,
  onPlayerSelected,
}) => {
  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(player => {
      // getPosicionFrontend ahora maneja strings como "LM,RM"
      const frontendPosition = getPosicionFrontend(player.PosicionJugadorDB);
      return frontendPosition === position;
    });
  }, [availablePlayers, position]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seleccionar Jugador ({position})</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Opción para vaciar el slot */}
        <button
          onClick={() => onPlayerSelected(null)} // Llamada con null para vaciar el slot
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md mb-4 transition-colors duration-200"
        >
          Vaciar Slot
        </button>

        {filteredPlayers.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">No hay cartas de jugadores disponibles para esta posición.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {filteredPlayers.map((jugador) => (
              <PlayerCard
                key={jugador.idCartaJugador}
                carta={{
                  idCartaJugador: jugador.idCartaJugador,
                  idJugador: jugador.Jugador_idJugadorDB, // Corregido: Jugador_idJugadorDB de CartaJugadorManager
                  Nombre: jugador.NombreJugador,
                  Posicion: jugador.PosicionJugadorDB, // Mantener PosicionJugadorDB para que PlayerCard muestre la posición detallada de la DB
                  PosicionFrontend: getPosicionFrontend(jugador.PosicionJugadorDB), // Usar la función para el mapeo
                  Rareza: jugador.Rareza as "Común" | "Raro" | "Épico" | "Legendario",
                  Puntos: jugador.Puntos,
                  Edad: jugador.Edad.toString(),
                  Pais: jugador.Pais,
                  Precio: jugador.Precio,
                  NombreEquipo: jugador.NombreEquipo,
                  objetosEquipados: [], // Se inicializan vacíos en la selección
                  maxObjetosSlots: obtenerSlotsObjetoPorRareza(jugador.Rareza as "Común" | "Raro" | "Épico" | "Legendario"),
                  posicionEnPlantilla: -1, // Valor temporal, se asigna en handlePlayerSelected
                }}
                onClick={() => onPlayerSelected(jugador)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSelectionModal;