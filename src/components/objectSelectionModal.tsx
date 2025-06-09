// components/PlayerSelectionModal.tsx
import React from 'react';
import PlayerCard from './playerCard';
// Asegúrate de que estas importaciones sean correctas y existan en tu '@/lib/data'
import { CartaJugadorManager, PosicionFrontend } from '@/lib/data';
import { obtenerSlotsObjetoPorRareza } from '@/lib/data';

interface PlayerSelectionModalProps {
  position: PosicionFrontend;
  availablePlayers: CartaJugadorManager[];
  onClose: () => void;
  // El nombre del prop esperado desde app/mi-equipo/page.tsx
  onPlayerSelected: (jugador: CartaJugadorManager) => void;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  position,
  availablePlayers,
  onClose,
  // Desestructuramos el prop con el nombre correcto
  onPlayerSelected,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-xl font-bold mb-4 text-center text-black dark:text-white">
          Seleccionar {position}
        </h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
        >
          &times;
        </button>

        {availablePlayers.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">No hay cartas de jugadores disponibles para esta posición.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {availablePlayers.map((jugador) => (
              <PlayerCard
                key={jugador.idCartaJugador}
                jugador={{
                  idCartaJugador: jugador.idCartaJugador,
                  // idJugador: jugador.idJugador, // Solo incluir si CartaJugadorEnPlantilla lo requiere y CartaJugadorManager lo tiene
                  Nombre: jugador.NombreJugador,
                  Posicion: jugador.PosicionJugadorDB,
                  Rareza: jugador.Rareza as "Comun" | "Raro" | "Epico" | "Legendario", // Asegura el tipo
                  Puntos: jugador.Puntos,
                  Edad: jugador.Edad.toString(), // Convierte a string si es necesario para PlayerCard
                  Pais: jugador.Pais,
                  Precio: jugador.Precio,
                  NombreEquipo: jugador.NombreEquipo,
                  objetosEquipados: [], // Siempre inicializar como array vacío aquí
                  maxObjetosSlots: obtenerSlotsObjetoPorRareza(jugador.Rareza),
                }}
                // ¡¡¡CAMBIO CRÍTICO AQUÍ!!! USAR 'onPlayerSelected' QUE ES EL PROP CORRECTO
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