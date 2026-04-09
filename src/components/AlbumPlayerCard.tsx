'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Carta } from '@/app/album/page';

interface AlbumPlayerCardProps {
    carta: Carta;
    onDelete: (carta: Carta) => void;
}

const RAREZA_CONFIG: Record<string, {
    gradient: string;
    border: string;
    badge: string;
    avatarBorder: string;
    starColor: string;
}> = {
    'Común':      { gradient: 'from-slate-500 via-slate-600 to-slate-700',    border: 'border-slate-300',  badge: 'bg-slate-100 text-slate-600',   avatarBorder: 'border-slate-300',  starColor: 'text-slate-300'  },
    'Raro':       { gradient: 'from-blue-500 via-blue-600 to-blue-800',        border: 'border-blue-400',   badge: 'bg-blue-100 text-blue-700',     avatarBorder: 'border-blue-200',   starColor: 'text-blue-200'   },
    'Épico':      { gradient: 'from-purple-600 via-purple-700 to-purple-900',  border: 'border-purple-500', badge: 'bg-purple-100 text-purple-700', avatarBorder: 'border-purple-200', starColor: 'text-purple-200' },
    'Legendario': { gradient: 'from-yellow-400 via-amber-500 to-orange-600',   border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-700', avatarBorder: 'border-yellow-200', starColor: 'text-yellow-200' },
};

const RAREZA_STARS: Record<string, string> = {
    'Común': '★', 'Raro': '★★', 'Épico': '★★★', 'Legendario': '★★★★',
};

export default function AlbumPlayerCard({ carta, onDelete }: AlbumPlayerCardProps) {
    const [showModal, setShowModal] = useState(false);
    const [imgError, setImgError] = useState(false);

    if (!carta) return null;

    const config = RAREZA_CONFIG[carta.Rareza] ?? RAREZA_CONFIG['Común'];
    const stars = RAREZA_STARS[carta.Rareza] ?? '★';
    const inicial = carta.Nombre ? carta.Nombre.charAt(0).toUpperCase() : '?';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    // w_80,h_80,c_fill: redimensiona al tamaño exacto del avatar
    // f_auto: WebP en navegadores compatibles
    // q_auto: compresión automática (~3KB vs ~30KB original)
    const imageUrl = cloudName
        ? `https://res.cloudinary.com/${cloudName}/image/upload/w_80,h_80,c_fill,f_auto,q_auto/estadio-fantasy/jugadores/${carta.jugadorId}.jpg`
        : `/images/jugadores/${carta.jugadorId}.jpg`;
    const isComun = carta.Rareza === 'Común';
    const valorVenta = isComun ? 3 : ({ 'Raro': 10, 'Épico': 20, 'Legendario': 40 }[carta.Rareza] ?? 0);

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
                            {carta.posicionFrontend ?? 'DEL'}
                        </span>
                        <span className={`text-xs font-bold ${config.starColor} drop-shadow`}>{stars}</span>
                    </div>
                    <div className={`w-20 h-20 rounded-full mx-auto mt-1 border-4 ${config.avatarBorder} bg-white/20 flex items-center justify-center overflow-hidden shadow-lg backdrop-blur-sm relative`}>
                        {!imgError && (
                            <Image
                                src={imageUrl}
                                alt={carta.Nombre}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        )}
                        {imgError && (
                            <span className="text-white text-3xl font-extrabold select-none">{inicial}</span>
                        )}
                    </div>
                </div>

                {/* White body */}
                <div className="bg-white dark:bg-gray-800 flex-1 flex flex-col px-3 pt-3 pb-2 -mt-5 rounded-t-2xl">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center text-sm leading-tight truncate">{carta.Nombre}</h3>
                    <p className="text-xs text-gray-400 text-center mb-1 truncate">{carta.NombreEquipo}</p>

                    <div className="flex justify-center mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                            {carta.Rareza}
                        </span>
                    </div>

                    <div className="text-center mb-2">
                        <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1">
                            <span className="text-xs font-bold text-amber-700">⭐ {carta.Puntos ?? 0} pts</span>
                        </div>
                    </div>

                    {carta.pais && (
                        <div className="text-xs text-gray-400 text-center mb-1">
                            {carta.pais}{carta.edad ? ` · ${carta.edad} años` : ''}
                        </div>
                    )}

                    <div className="mt-auto flex flex-col gap-1">
                        {carta.jugadorId && (
                            <Link
                                href={`/jugador/${carta.jugadorId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-1.5 text-center bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Ver estadísticas
                            </Link>
                        )}
                        {!isComun && (
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-center text-gray-400">Venta: <span className="font-semibold text-gray-600">{valorVenta} 🏐</span></p>
                                <button
                                    className="w-full py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    onClick={(e) => { e.stopPropagation(); onDelete(carta); }}
                                >
                                    Vender carta
                                </button>
                            </div>
                        )}
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
                            <div className={`w-16 h-16 rounded-full ${config.avatarBorder} border-4 bg-white/20 flex items-center justify-center text-white text-3xl font-extrabold mb-2`}>
                                {inicial}
                            </div>
                            <h2 className="text-white font-bold text-lg text-center">{carta.Nombre}</h2>
                            <p className="text-white/70 text-sm">{carta.NombreEquipo}</p>
                            <span className={`text-xs font-semibold mt-1 px-3 py-0.5 rounded-full ${config.badge}`}>
                                {carta.Rareza} {stars}
                            </span>
                        </div>

                        {/* Modal body */}
                        <div className="p-5 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-2 text-center">
                                    <p className="text-xs text-amber-500 font-semibold mb-0.5">Puntos totales</p>
                                    <p className="text-lg font-bold text-amber-800 dark:text-amber-300">⭐ {carta.Puntos ?? 0}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2 text-center">
                                    <p className="text-xs text-blue-500 font-semibold mb-0.5">Unidades</p>
                                    <p className="text-lg font-bold text-blue-800 dark:text-blue-300">×{carta.unidades ?? 1}</p>
                                </div>
                                {carta.posicionFrontend && (
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                        <p className="text-xs text-slate-500 font-semibold mb-0.5">Posición</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{carta.posicionFrontend}</p>
                                    </div>
                                )}
                                {carta.pais && (
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                        <p className="text-xs text-slate-500 font-semibold mb-0.5">País</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{carta.pais}</p>
                                    </div>
                                )}
                                {carta.edad && (
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                                        <p className="text-xs text-slate-500 font-semibold mb-0.5">Edad</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{carta.edad} años</p>
                                    </div>
                                )}
                                {carta.precio != null && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-2 text-center">
                                        <p className="text-xs text-yellow-600 font-semibold mb-0.5">Valor</p>
                                        <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">💰 {carta.precio}</p>
                                    </div>
                                )}
                            </div>

                            {carta.jugadorId && (
                                <Link
                                    href={`/jugador/${carta.jugadorId}`}
                                    className="block w-full mt-2 py-2 text-center bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Ver estadísticas por jornada →
                                </Link>
                            )}
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
