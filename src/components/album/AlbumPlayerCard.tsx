'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Carta } from '@/lib/album-types';
import { RAREZA_CONFIG, RAREZA_STARS } from '@/lib/rareza-config';
import { valorVentaJugador } from '@/lib/rewards';
import RarityBadge from '@/components/ui/RarityBadge';
import { getPlayerImageUrl } from '@/lib/player-image';

interface AlbumPlayerCardProps {
    carta: Carta;
    onDelete: (carta: Carta) => void;
}

export default function AlbumPlayerCard({ carta, onDelete }: AlbumPlayerCardProps) {
    const [showModal, setShowModal] = useState(false);
    const [imgError, setImgError] = useState(false);

    if (!carta) return null;

    const config = RAREZA_CONFIG[carta.Rareza] ?? RAREZA_CONFIG['Común'];
    const stars = RAREZA_STARS[carta.Rareza] ?? '★';
    const inicial = carta.Nombre ? carta.Nombre.charAt(0).toUpperCase() : '?';
    const imageUrl = getPlayerImageUrl(carta.slug, 80, carta.jugadorId);
    const isComun = carta.Rareza === 'Común';
    const valorVenta = valorVentaJugador(carta.Rareza);

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
                        {imageUrl && !imgError ? (
                            <Image
                                src={imageUrl}
                                alt={carta.Nombre}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <span className="text-white text-3xl font-extrabold select-none">{inicial}</span>
                        )}
                    </div>
                </div>

                {/* White body */}
                <div className="bg-white dark:bg-gray-800 flex-1 flex flex-col px-3 pt-3 pb-2 -mt-5 rounded-t-2xl">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center text-sm leading-tight line-clamp-2">{carta.Nombre}</h3>
                    <p className="text-xs text-gray-400 text-center mb-1 truncate">{carta.NombreEquipo}</p>

                    <div className="flex justify-center mb-2">
                        <RarityBadge rareza={carta.Rareza} />
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
                            <div className={`w-16 h-16 rounded-full ${config.avatarBorder} border-4 bg-white/20 flex items-center justify-center overflow-hidden mb-2`}>
                                {imageUrl && !imgError ? (
                                    <Image src={imageUrl} alt={carta.Nombre} width={64} height={64} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                                ) : (
                                    <span className="text-white text-3xl font-extrabold select-none">{inicial}</span>
                                )}
                            </div>
                            <h2 className="text-white font-bold text-lg text-center">{carta.Nombre}</h2>
                            <p className="text-white/70 text-sm">{carta.NombreEquipo}</p>
                            <RarityBadge rareza={carta.Rareza} showStars className="mt-1 px-3" />
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
