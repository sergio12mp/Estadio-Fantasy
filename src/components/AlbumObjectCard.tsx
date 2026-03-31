'use client';

import React, { useState } from 'react';
import { Carta } from '@/app/album/page';

interface AlbumObjectCardProps {
    carta: Carta;
    onDelete: (carta: Carta) => void;
}

const RAREZA_CONFIG: Record<string, {
    gradient: string;
    border: string;
    badge: string;
    icon: string;
    starColor: string;
}> = {
    'Común':      { gradient: 'from-slate-500 via-slate-600 to-slate-700',   border: 'border-slate-300',  badge: 'bg-slate-100 text-slate-600',   icon: '🎯', starColor: 'text-slate-300'  },
    'Raro':       { gradient: 'from-blue-500 via-blue-600 to-blue-800',       border: 'border-blue-400',   badge: 'bg-blue-100 text-blue-700',     icon: '🛡️', starColor: 'text-blue-200'   },
    'Épico':      { gradient: 'from-purple-600 via-purple-700 to-purple-900', border: 'border-purple-500', badge: 'bg-purple-100 text-purple-700', icon: '⚡', starColor: 'text-purple-200' },
    'Legendario': { gradient: 'from-yellow-400 via-amber-500 to-orange-600',  border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-700', icon: '👑', starColor: 'text-yellow-200' },
};

const RAREZA_STARS: Record<string, string> = {
    'Común': '★', 'Raro': '★★', 'Épico': '★★★', 'Legendario': '★★★★',
};

function formatEfecto(efecto?: string, valor?: number, estadistica?: string): string {
    if (!efecto || valor == null) return '';
    const stat = estadistica ?? 'puntos';
    if (efecto === 'multiplicador') {
        const pct = Math.round((valor - 1) * 100);
        if (pct >= 0) return `+${pct}% en ${stat}`;
        return `${pct}% en ${stat}`;
    }
    if (efecto === 'suma') {
        return `+${valor} pts por ${stat}`;
    }
    return `${efecto}: ${valor}`;
}

export default function AlbumObjectCard({ carta, onDelete }: AlbumObjectCardProps) {
    const [showModal, setShowModal] = useState(false);
    const config = RAREZA_CONFIG[carta.Rareza] ?? RAREZA_CONFIG['Común'];
    const stars = RAREZA_STARS[carta.Rareza] ?? '★';
    const imageUrl = `/images/objetos/${carta.idObjetos}.png`;
    const efectoLabel = formatEfecto(carta.Efecto, carta.ValorEfecto, carta.Estadistica);
    const valorVenta = ({ 'Común': 5, 'Raro': 10, 'Épico': 15, 'Legendario': 20 }[carta.Rareza] ?? 5);

    return (
        <>
            <div
                className={`rounded-xl overflow-hidden border-2 ${config.border} shadow-md flex flex-col w-full h-full hover:scale-[1.02] hover:shadow-xl transition-all duration-200 cursor-pointer`}
                onClick={() => setShowModal(true)}
            >
                {/* Gradient header */}
                <div className={`bg-gradient-to-b ${config.gradient} px-3 pt-3 pb-10 relative`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white/90 uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                            Objeto
                        </span>
                        <span className={`text-xs font-bold ${config.starColor}`}>{stars}</span>
                    </div>
                    <div className="w-20 h-20 rounded-full mx-auto mt-1 border-4 border-white/30 bg-white/20 flex items-center justify-center overflow-hidden shadow-lg backdrop-blur-sm relative">
                        <img
                            src={imageUrl}
                            alt={carta.Nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-4xl select-none absolute">{config.icon}</span>
                    </div>
                </div>

                {/* Body */}
                <div className="bg-white dark:bg-gray-800 flex-1 flex flex-col px-3 pt-3 pb-2 -mt-5 rounded-t-2xl">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center text-sm leading-tight truncate">{carta.Nombre}</h3>

                    <div className="flex justify-center my-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                            {carta.Rareza}
                        </span>
                    </div>

                    {efectoLabel && (
                        <p className="text-xs text-center text-green-700 dark:text-green-400 font-medium mb-1">{efectoLabel}</p>
                    )}

                    {carta.Estadistica && (
                        <p className="text-xs text-center text-gray-500 mb-1">Stat: <span className="font-semibold">{carta.Estadistica}</span></p>
                    )}

                    <div className="mt-auto">
                        <p className="text-xs text-center text-gray-400 mb-1">Venta: <span className="font-semibold text-gray-600">{valorVenta} 🏐</span></p>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(carta); }}
                            className="w-full py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Vender objeto
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm border-2 ${config.border}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className={`bg-gradient-to-b ${config.gradient} px-6 py-5 flex flex-col items-center`}>
                            <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl mb-2">
                                {config.icon}
                            </div>
                            <h2 className="text-white font-bold text-lg text-center">{carta.Nombre}</h2>
                            <span className={`text-xs font-semibold mt-1 px-3 py-0.5 rounded-full ${config.badge}`}>
                                {carta.Rareza} {stars}
                            </span>
                        </div>

                        {/* Modal body */}
                        <div className="p-5 space-y-3">
                            {carta.Descripcion && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descripción</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{carta.Descripcion}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                {carta.Estadistica && (
                                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 text-center">
                                        <p className="text-xs text-blue-500 font-semibold mb-0.5">Estadística</p>
                                        <p className="text-sm font-bold text-blue-800 dark:text-blue-300">{carta.Estadistica}</p>
                                    </div>
                                )}
                                {carta.Efecto && (
                                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2 text-center">
                                        <p className="text-xs text-purple-500 font-semibold mb-0.5">Tipo de efecto</p>
                                        <p className="text-sm font-bold text-purple-800 dark:text-purple-300 capitalize">{carta.Efecto}</p>
                                    </div>
                                )}
                                {carta.ValorEfecto != null && (
                                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2 text-center">
                                        <p className="text-xs text-green-500 font-semibold mb-0.5">Magnitud</p>
                                        <p className="text-sm font-bold text-green-800 dark:text-green-300">
                                            {carta.Efecto === 'multiplicador'
                                                ? `×${carta.ValorEfecto}`
                                                : `+${carta.ValorEfecto}`}
                                        </p>
                                    </div>
                                )}
                                {efectoLabel && (
                                    <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-2 text-center">
                                        <p className="text-xs text-amber-500 font-semibold mb-0.5">Efecto total</p>
                                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{efectoLabel}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full mt-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
