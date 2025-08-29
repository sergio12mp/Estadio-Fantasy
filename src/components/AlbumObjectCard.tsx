import React from 'react';
import { Carta } from '@/app/album/page';

interface AlbumObjectCardProps {
    carta: Carta;
    onDelete: (carta: Carta) => void;
}

export default function AlbumObjectCard({ carta, onDelete }: AlbumObjectCardProps) {
    const imageUrl = `/images/objetos/${carta.idObjetos}.png`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center flex flex-col items-center justify-between">
            {/* Contenedor de la imagen con la lógica del placeholder de texto */}
            <div className="relative w-24 h-24 mx-auto mb-2 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-4xl">
                <img 
                    src={imageUrl} 
                    alt={carta.Nombre} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }} 
                />
                <span className="absolute">
                    {carta.Nombre ? carta.Nombre.charAt(0) : '?'}
                </span>
            </div>
            
            <h3 className="text-sm font-bold truncate w-full">{carta.Nombre}</h3>
            <p className="text-xs text-gray-500 capitalize">{carta.Rareza}</p>
            
            <button 
                onClick={() => onDelete(carta)} 
                className="mt-2 text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
                Vender
            </button>
        </div>
    );
}