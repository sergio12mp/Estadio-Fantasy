// src/components/playerCard.tsx
import React from 'react';
import { CartaJugadorEnPlantilla, ObjetoEquipado } from '@/lib/data';

interface PlayerCardProps {
  carta: CartaJugadorEnPlantilla;
  onEquipObject?: (playerId: number, object: ObjetoEquipado) => void;
  onClick?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ carta, onEquipObject, onClick }) => {
  if (!carta) {
    return null;
  }

  const maxObjetosSlots = carta.maxObjetosSlots || 0;
  const objetosEquipados = carta.objetosEquipados || [];

  return (
    // Añadido w-full h-full para que ocupe todo el espacio del contenedor
    <div
      className={`border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-sm relative text-center bg-white dark:bg-gray-800 text-black dark:text-white
                  ${onClick ? 'cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200' : ''}
                  w-full h-full flex flex-col justify-between`} // <--- ¡CAMBIOS CRUCIALES DE TAMAÑO Y FLEXBOX!
      onClick={onClick}
    >
      <div> {/* Contenedor para el contenido superior */}
        <h3 className="font-bold text-lg mb-1 truncate">{carta.Nombre}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{carta.PosicionFrontend} - {carta.Rareza}</p>

        <div className="relative w-24 h-24 mx-auto mb-2 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-4xl">
          {carta.Nombre ? carta.Nombre.charAt(0) : '?'}
        </div>

        <p className="text-sm font-semibold mb-1">Puntos: {carta.Puntos}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Edad: {carta.Edad} | País: {carta.Pais}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Equipo: {carta.NombreEquipo}</p>
      </div>

      {/* Sección de Objetos Equipados */}
      <div className="mt-auto text-sm"> {/* mt-auto para empujar hacia abajo */}
        <h4 className="font-semibold mb-1">Objetos:</h4>
        {objetosEquipados.length > 0 ? (
          objetosEquipados.map((obj, idx) => (
            <div key={idx} className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-1 rounded-md mb-1">
              <div className="w-6 h-6 mr-1 relative bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs rounded">
                OBJ
              </div>
              <span className="truncate">{obj.Nombre} ({obj.Rareza})</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Ninguno</p>
        )}
        {/* Botón para equipar objeto si hay slots disponibles */}
        {maxObjetosSlots > objetosEquipados.length && onEquipObject && (
          <button
            onClick={(e) => {
                e.stopPropagation();
                onEquipObject(carta.idCartaJugador, {} as ObjetoEquipado);
            }}
            className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700"
          >
            Equipar Objeto
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;