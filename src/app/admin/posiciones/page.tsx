'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import RequireAuth from '@/components/RequireAuth';

type PosicionFrontend = 'POR' | 'DEF' | 'MED' | 'DEL';

interface JugadorRow {
    idJugador: number;
    Nombre: string;
    Posicion: string;          // string DB (ej. "RW,CM")
    NombreEquipo: string;
    posicionMapeada: PosicionFrontend; // calculada automáticamente
    override: PosicionFrontend | null; // override guardado en DB
}

const POS_OPTIONS: PosicionFrontend[] = ['POR', 'DEF', 'MED', 'DEL'];

const POS_COLORS: Record<PosicionFrontend, string> = {
    POR: 'bg-yellow-100 text-yellow-800',
    DEF: 'bg-blue-100 text-blue-800',
    MED: 'bg-green-100 text-green-800',
    DEL: 'bg-red-100 text-red-800',
};

function PosicionBadge({ pos, small = false }: { pos: PosicionFrontend; small?: boolean }) {
    return (
        <span className={`inline-block font-bold rounded px-2 py-0.5 ${small ? 'text-xs' : 'text-sm'} ${POS_COLORS[pos]}`}>
            {pos}
        </span>
    );
}

function PosicionesAdminContent() {
    const [jugadores, setJugadores] = useState<JugadorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [todosLosEquipos, setTodosLosEquipos] = useState<string[]>([]);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [equipoFiltro, setEquipoFiltro] = useState('');
    const [posFiltro, setPosFiltro] = useState('');
    const [soloOverrides, setSoloOverrides] = useState(false);

    // Estado local de overrides (para cambios optimistas)
    const [overridesLocales, setOverridesLocales] = useState<Record<number, PosicionFrontend | null>>({});

    const cargarJugadores = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (busqueda) params.set('nombre', busqueda);
        if (equipoFiltro) params.set('equipo', equipoFiltro);
        if (posFiltro) params.set('posicion', posFiltro);
        if (soloOverrides) params.set('soloOverrides', '1');

        try {
            const res = await fetch(`/api/admin/posiciones?${params}`);
            const data = await res.json();
            setJugadores(data.jugadores ?? []);
            setOverridesLocales({});
        } catch {
            setJugadores([]);
        } finally {
            setLoading(false);
        }
    }, [busqueda, equipoFiltro, posFiltro, soloOverrides]);

    // Cargar lista de equipos una sola vez al montar
    useEffect(() => {
        fetch('/api/admin/posiciones')
            .then(r => r.json())
            .then(data => {
                const equipos = Array.from(new Set((data.jugadores ?? []).map((j: JugadorRow) => j.NombreEquipo))).sort() as string[];
                setTodosLosEquipos(equipos);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const timer = setTimeout(cargarJugadores, 300);
        return () => clearTimeout(timer);
    }, [cargarJugadores]);

    const guardarOverride = async (idJugador: number, posicion: PosicionFrontend | '') => {
        setSaving(idJugador);
        const nuevaPos = posicion === '' ? null : posicion;

        // Optimista
        setOverridesLocales(prev => ({ ...prev, [idJugador]: nuevaPos }));

        try {
            await fetch('/api/admin/posiciones', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idJugador, posicionFrontend: nuevaPos }),
            });
        } catch {
            // Revertir si falla
            setOverridesLocales(prev => { const next = { ...prev }; delete next[idJugador]; return next; });
        } finally {
            setSaving(null);
        }
    };

    const exportarSQL = () => {
        window.open('/api/admin/posiciones/export', '_blank');
    };


    return (
        <div className="min-h-screen bg-gray-50 pt-[76px] pb-10 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Volver al admin</Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-1">Posiciones de jugadores</h1>
                        <p className="text-sm text-gray-500">Fuerza la posición frontend de cada jugador, ignorando el mapeo automático de FBref.</p>
                    </div>
                    <button
                        onClick={exportarSQL}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        ⬇ Exportar overrides (.sql)
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Buscar jugador</label>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                            placeholder="Nombre..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="min-w-[160px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Equipo</label>
                        <select
                            value={equipoFiltro}
                            onChange={e => setEquipoFiltro(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos</option>
                            {todosLosEquipos.map(eq => (
                                <option key={eq} value={eq}>{eq}</option>
                            ))}
                        </select>
                    </div>
                    <div className="min-w-[130px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Posición activa</label>
                        <select
                            value={posFiltro}
                            onChange={e => setPosFiltro(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas</option>
                            {POS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 pb-1">
                        <input
                            type="checkbox"
                            id="soloOverrides"
                            checked={soloOverrides}
                            onChange={e => setSoloOverrides(e.target.checked)}
                            className="w-4 h-4 accent-blue-600"
                        />
                        <label htmlFor="soloOverrides" className="text-sm text-gray-700 select-none">Solo con override</label>
                    </div>
                    <button
                        onClick={() => { setBusqueda(''); setEquipoFiltro(''); setPosFiltro(''); setSoloOverrides(false); }}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 underline"
                    >
                        Limpiar
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="py-16 text-center text-gray-400">Cargando jugadores...</div>
                    ) : jugadores.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">No se encontraron jugadores.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Jugador</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Equipo</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Posición DB</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Auto</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Override</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Activa</th>
                                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Cambiar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {jugadores.map(j => {
                                    const ov = j.idJugador in overridesLocales ? overridesLocales[j.idJugador] : j.override;
                                    const posActiva: PosicionFrontend = ov ?? j.posicionMapeada;
                                    const tieneOverride = ov != null;

                                    return (
                                        <tr key={j.idJugador} className={tieneOverride ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-gray-900">{j.Nombre}</span>
                                                {tieneOverride && (
                                                    <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-semibold">override</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{j.NombreEquipo}</td>
                                            <td className="px-4 py-3 text-center">
                                                <code className="text-xs bg-gray-100 rounded px-1.5 py-0.5 text-gray-700">{j.Posicion}</code>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <PosicionBadge pos={j.posicionMapeada} small />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {ov ? <PosicionBadge pos={ov} small /> : <span className="text-gray-300 text-xs">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <PosicionBadge pos={posActiva} />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <select
                                                        disabled={saving === j.idJugador}
                                                        value={ov ?? ''}
                                                        onChange={e => guardarOverride(j.idJugador, e.target.value as PosicionFrontend | '')}
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                                    >
                                                        <option value="">Auto ({j.posicionMapeada})</option>
                                                        {POS_OPTIONS.map(p => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                    {saving === j.idJugador && (
                                                        <span className="text-xs text-blue-500 animate-pulse">...</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <p className="mt-3 text-xs text-gray-400 text-center">
                    {jugadores.length} jugadores · Los cambios se aplican inmediatamente · Exporta el SQL para restaurar tras un reset de BD.
                </p>
            </div>
        </div>
    );
}

export default function PosicionesAdminPage() {
    return (
        <RequireAuth>
            <PosicionesAdminContent />
        </RequireAuth>
    );
}
