// src/components/AlbumProgress.tsx
'use client';

import React, { useMemo } from 'react';

// Nuevo helper para normalizar strings (sin acentos, minúsculas)
const normalizeString = (str: string) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

interface Carta {
    tipo: 'jugador' | 'objeto';
    Rareza: string;
    Nombre: string;
    NombreEquipo?: string;
    id: number;
}

interface AlbumProgressProps {
    cartas: Carta[];
}

const AlbumProgress: React.FC<AlbumProgressProps> = ({ cartas }) => {
    const progress = useMemo(() => {
        // Usamos el número total de jugadores que me indicaste.
        // Esto debería venir de una consulta a la base de datos en una aplicación real.
        const TOTAL_JUGADORES = 421;
        const TOTAL_RAREZAS_A_COLECCIONAR = 3; // Raro, Épico, Legendario

        const totalToCollect = TOTAL_JUGADORES * TOTAL_RAREZAS_A_COLECCIONAR;

        const collectedCards = new Set();
        cartas.forEach(carta => {
            // Las cartas comunes no cuentan
            const normalizedRareza = normalizeString(carta.Rareza);
            if (normalizedRareza === 'raro' || normalizedRareza === 'epico' || normalizedRareza === 'legendario') {
                const uniqueKey = `${normalizeString(carta.Nombre)}-${normalizedRareza}`;
                collectedCards.add(uniqueKey);
            }
        });

        const collectedCount = collectedCards.size;
        const percentage = totalToCollect > 0 ? (collectedCount / totalToCollect) * 100 : 0;

        return {
            percentage: Math.min(100, percentage),
            collectedCount,
            totalToCollect,
        };
    }, [cartas]);

    const percentageRounded = progress.percentage.toFixed(2);

    return (
        <div className="my-4">
            <h2 className="text-xl font-bold mb-2">Progreso de la Colección</h2>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${percentageRounded}%` }}
                ></div>
            </div>
            <p className="text-sm text-center">
                {percentageRounded}% ({progress.collectedCount} de {progress.totalToCollect} cartas únicas)
            </p>
        </div>
    );
};

export default AlbumProgress;