// src/components/AlbumPlayerCard.tsx
import React from 'react';
import { CartaJugadorEnPlantilla } from '@/lib/data';

interface AlbumPlayerCardProps {
    carta: CartaJugadorEnPlantilla;
    onDelete: (carta: any) => void;
}

const AlbumPlayerCard: React.FC<AlbumPlayerCardProps> = ({ carta, onDelete }) => {
    if (!carta) {
        return null;
    }

    const imageUrl = `/images/jugadores/${carta.idCartaJugador}.png`;

    return (
        <div
            className={`border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-sm relative text-center bg-white dark:bg-gray-800 text-black dark:text-white
                     cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200
                     w-full h-full flex flex-col justify-between`}
        >
            <div>
                <h3 className="font-bold text-lg mb-1 truncate">{carta.NombreJugador}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{carta.PosicionFrontend} - {carta.Rareza}</p>

                {/* Container for the image or the text-based placeholder */}
                <div className="relative w-24 h-24 mx-auto mb-2 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-4xl">
                    <img
                        src={imageUrl}
                        alt={carta.NombreJugador}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // On error, hide the image and let the parent div's content show through
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <span className="absolute">{carta.NombreJugador ? carta.NombreJugador.charAt(0) : '?'}</span>
                </div>

                <p className="text-sm font-semibold mb-1">Puntos: {carta.Puntos}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Edad: {carta.Edad} | País: {carta.Pais}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Equipo: {carta.NombreEquipo}</p>
            </div>

            <div className="mt-auto text-sm">
                {!(carta.Rareza?.toLowerCase() === 'comun') && (
                    <button
                        className="w-full px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                        onClick={() => onDelete(carta)}
                    >
                        Eliminar
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlbumPlayerCard;