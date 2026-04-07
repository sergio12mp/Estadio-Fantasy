'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import RequireAuth from '@/components/RequireAuth';
import Link from 'next/link';

interface DesgloseStat {
    stat: string;
    label: string;
    valor: number;
    puntos: number;
}

interface EstadisticaJornada {
    idJornada: number;
    NombreJornada: string;
    Puntos: number;
    desglose: DesgloseStat[];
}

interface JugadorInfo {
    idJugador: number;
    Nombre: string;
    Posicion: string;
    Edad: string;
    Pais: string;
    Precio: number;
    NombreEquipo: string;
}

function JugadorContent() {
    const params = useParams();
    const idJugador = params.id as string;

    const [jugador, setJugador] = useState<JugadorInfo | null>(null);
    const [estadisticas, setEstadisticas] = useState<EstadisticaJornada[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jornadaAbierta, setJornadaAbierta] = useState<number | null>(null);

    useEffect(() => {
        if (!idJugador) return;
        fetch(`/api/jugador/${idJugador}/estadisticas`)
            .then(r => r.json())
            .then(data => {
                if (data.error) { setError(data.error); return; }
                setJugador(data.jugador);
                setEstadisticas(data.estadisticas);
                if (data.estadisticas.length > 0) {
                    setJornadaAbierta(data.estadisticas[data.estadisticas.length - 1].idJornada);
                }
            })
            .catch(() => setError('Error al cargar los datos'))
            .finally(() => setLoading(false));
    }, [idJugador]);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center pt-16 text-xl">Cargando...</div>;
    if (error || !jugador) return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center pt-16 gap-4">
            <p className="text-red-400 text-lg">{error ?? 'Jugador no encontrado'}</p>
            <Link href="/album" className="text-blue-400 hover:underline">← Volver al álbum</Link>
        </div>
    );

    const totalPuntos = estadisticas.reduce((s, e) => s + (e.Puntos ?? 0), 0);
    const inicial = jugador.Nombre.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-[76px] pb-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back */}
                <Link href="/album" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
                    ← Volver al álbum
                </Link>

                {/* Player header */}
                <div className="bg-gray-800 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-extrabold shrink-0">
                        {inicial}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold">{jugador.Nombre}</h1>
                        <p className="text-gray-400">{jugador.NombreEquipo} · {jugador.Posicion}</p>
                        <p className="text-gray-500 text-sm mt-1">{jugador.Pais}{jugador.Edad ? ` · ${jugador.Edad.split('-')[0]} años` : ''}</p>
                    </div>
                    <div className="flex gap-4 text-center shrink-0">
                        <div className="bg-amber-900/40 border border-amber-600/40 rounded-xl px-4 py-3">
                            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide">Puntos totales</p>
                            <p className="text-2xl font-bold text-amber-300">⭐ {parseFloat(totalPuntos.toFixed(2))}</p>
                        </div>
                        <div className="bg-blue-900/40 border border-blue-600/40 rounded-xl px-4 py-3">
                            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide">Jornadas</p>
                            <p className="text-2xl font-bold text-blue-300">{estadisticas.length}</p>
                        </div>
                    </div>
                </div>

                {/* Stats per jornada */}
                {estadisticas.length === 0 ? (
                    <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
                        Este jugador no tiene estadísticas registradas aún.
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-300">Estadísticas por jornada</h2>
                        {[...estadisticas].reverse().map((est) => {
                            const abierta = jornadaAbierta === est.idJornada;
                            const pts = est.Puntos ?? 0;
                            return (
                                <div key={est.idJornada} className="bg-gray-800 rounded-xl overflow-hidden">
                                    {/* Jornada header (clickable) */}
                                    <button
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-750 transition-colors"
                                        onClick={() => setJornadaAbierta(abierta ? null : est.idJornada)}
                                    >
                                        <span className="font-semibold text-white">{est.NombreJornada}</span>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                                pts < 0 ? 'bg-red-900/50 text-red-300' :
                                                pts >= 15 ? 'bg-green-900/50 text-green-300' :
                                                'bg-amber-900/50 text-amber-300'
                                            }`}>
                                                ⭐ {parseFloat(pts.toFixed(2))} pts
                                            </span>
                                            <span className="text-gray-400 text-sm">{abierta ? '▲' : '▼'}</span>
                                        </div>
                                    </button>

                                    {/* Desglose */}
                                    {abierta && (
                                        <div className="px-5 pb-5 border-t border-gray-700">
                                            {est.desglose.length === 0 ? (
                                                <p className="text-gray-500 text-sm mt-3">No hubo estadísticas relevantes esta jornada.</p>
                                            ) : (
                                                <table className="w-full mt-3 text-sm">
                                                    <thead>
                                                        <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-700">
                                                            <th className="text-left py-1.5">Estadística</th>
                                                            <th className="text-right py-1.5">Valor</th>
                                                            <th className="text-right py-1.5">Puntos</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {est.desglose.map((d) => (
                                                            <tr key={d.stat} className="border-b border-gray-700/50">
                                                                <td className="py-1.5 text-gray-300">{d.label}</td>
                                                                <td className="py-1.5 text-right text-white font-medium">{d.valor}</td>
                                                                <td className={`py-1.5 text-right font-semibold ${d.puntos < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                    {d.puntos > 0 ? '+' : ''}{d.puntos}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr className="border-t-2 border-gray-600">
                                                            <td className="py-2 font-bold text-white" colSpan={2}>Total jornada</td>
                                                            <td className={`py-2 text-right font-bold text-base ${pts < 0 ? 'text-red-400' : 'text-amber-300'}`}>
                                                                ⭐ {parseFloat(pts.toFixed(2))}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function JugadorPage() {
    return (
        <RequireAuth>
            <JugadorContent />
        </RequireAuth>
    );
}
