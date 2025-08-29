// src/components/CartaObjeto.tsx
import React from 'react';
import { CartaObjetoManager } from '@/lib/data';

interface CartaObjetoProps {
    carta: CartaObjetoManager;
    onEliminar: (carta: CartaObjetoManager) => void;
}

export default function CartaObjeto({ carta, onEliminar }: CartaObjetoProps) {
    // Aquí puedes usar una imagen para la carta de objeto, si tienes una URL
    const urlImagen = `/objetos/${carta.idObjetos}.png`;

    return (
        <div className="bg-white rounded-lg shadow-md p-4 text-center transform transition duration-200 hover:scale-105">
            <img
                src={urlImagen}
                alt={carta.NombreObjeto}
                className="w-24 h-24 mx-auto mb-2"
            />
            <h3 className="font-bold text-lg mb-1">{carta.NombreObjeto}</h3>
            <p className="text-sm text-gray-500 capitalize">{carta.Rareza}</p>

            {/* Botón para eliminar o vender el objeto */}
            <button
                onClick={() => onEliminar(carta)}
                className="mt-4 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
            >
                Vender
            </button>
        </div>
    );
}