'use client';

import { useState, useMemo } from 'react';
import AlbumPlayerCard from './AlbumPlayerCard';
import AlbumObjectCard from './AlbumObjectCard';
import { Carta } from '@/app/album/page';

const RAREZAS = ['Común', 'Raro', 'Épico', 'Legendario'];
const POSICIONES = ['POR', 'DEF', 'MED', 'DEL'];

interface AlbumViewProps {
    cartas: Carta[];
    eliminarCarta: (carta: Carta) => void;
    venderMultiple: (cartas: Carta[]) => Promise<void>;
    filtroTipo: string;
    setFiltroTipo: (tipo: string) => void;
    filtroRareza: string[];
    setFiltroRareza: (rareza: string) => void;
    filtroEquipo: string;
    setFiltroEquipo: (equipo: string) => void;
    filtroPosicion: string;
    setFiltroPosicion: (pos: string) => void;
    filtroEstadistica: string;
    setFiltroEstadistica: (stat: string) => void;
    filtroEfecto: string;
    setFiltroEfecto: (efecto: string) => void;
    filtroJornada: number | null;
    setFiltroJornada: (id: number | null) => void;
    filtroMinPuntos: string;
    setFiltroMinPuntos: (v: string) => void;
    jornadas: { idJornada: number; Nombre: string }[];
    busqueda: string;
    setBusqueda: (busqueda: string) => void;
    mensaje: string;
    ordenarPor: string;
    setOrdenarPor: (orden: string) => void;
    equiposUnicos: string[];
    estadisticasUnicas: string[];
    limpiarFiltros: () => void;
    paginaActual: number;
    totalPaginas: number;
    itemsPorPagina: number;
    setPaginaActual: (pagina: number) => void;
    setItemsPorPagina: (items: number) => void;
    itemsPorPaginaOptions: number[];
    onEliminarDuplicados?: () => void;
    onEliminarComunesRepetidos?: () => void;
    countDuplicadosVendibles?: number;
    countDuplicadosComunes?: number;
}

const selectClass = 'bg-white text-black dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm';

function valorVentaCarta(c: Carta): number {
    if (c.tipo === 'jugador' && c.Rareza === 'Común') return 0; // no vendible
    switch (c.Rareza) {
        case 'Común': return 5;
        case 'Raro': return 10;
        case 'Épico': return 15;
        case 'Legendario': return 20;
        default: return 0;
    }
}

function puedeVender(c: Carta): boolean {
    return !(c.tipo === 'jugador' && c.Rareza === 'Común');
}

export default function AlbumView({
    cartas,
    eliminarCarta,
    venderMultiple,
    filtroTipo,
    setFiltroTipo,
    filtroRareza,
    setFiltroRareza,
    filtroEquipo,
    setFiltroEquipo,
    filtroPosicion,
    setFiltroPosicion,
    filtroEstadistica,
    setFiltroEstadistica,
    filtroEfecto,
    setFiltroEfecto,
    filtroJornada,
    setFiltroJornada,
    filtroMinPuntos,
    setFiltroMinPuntos,
    jornadas,
    busqueda,
    setBusqueda,
    mensaje,
    ordenarPor,
    setOrdenarPor,
    equiposUnicos,
    estadisticasUnicas,
    limpiarFiltros,
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    setPaginaActual,
    setItemsPorPagina,
    itemsPorPaginaOptions,
    onEliminarDuplicados,
    onEliminarComunesRepetidos,
    countDuplicadosVendibles = 0,
    countDuplicadosComunes = 0,
}: AlbumViewProps) {
    const [isGridView, setIsGridView] = useState(true);
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());
    const [showConfirm, setShowConfirm] = useState(false);
    const [vendiendo, setVendiendo] = useState(false);

    const handleNextPage = () => setPaginaActual(Math.min(paginaActual + 1, totalPaginas));
    const handlePrevPage = () => setPaginaActual(Math.max(paginaActual - 1, 1));

    const handleItemsPorPaginaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setItemsPorPagina(value === 'Infinity' ? Infinity : Number(value));
        setPaginaActual(1);
    };

    const mostrarJugador = filtroTipo === 'jugador' || filtroTipo === 'todos';
    const mostrarObjeto = filtroTipo === 'objeto' || filtroTipo === 'todos';

    const toggleSeleccion = (c: Carta) => {
        if (!puedeVender(c)) return;
        setSeleccionadas(prev => {
            const next = new Set(prev);
            if (next.has(c.id)) next.delete(c.id);
            else next.add(c.id);
            return next;
        });
    };

    const cartasSeleccionadasList = useMemo(
        () => cartas.filter(c => seleccionadas.has(c.id)),
        [cartas, seleccionadas]
    );

    const totalBalones = useMemo(
        () => cartasSeleccionadasList.reduce((sum, c) => sum + valorVentaCarta(c), 0),
        [cartasSeleccionadasList]
    );

    const handleToggleModoSeleccion = () => {
        setModoSeleccion(prev => !prev);
        setSeleccionadas(new Set());
        setShowConfirm(false);
    };

    const handleVenderConfirmado = async () => {
        setVendiendo(true);
        await venderMultiple(cartasSeleccionadasList);
        setSeleccionadas(new Set());
        setModoSeleccion(false);
        setShowConfirm(false);
        setVendiendo(false);
    };

    return (
        <>
            {/* ── Barra de búsqueda y tipo ── */}
            <div className="flex flex-wrap gap-2 items-center mb-3">
                <input
                    type="text"
                    placeholder="Buscar por nombre, equipo o estadística..."
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                    className="flex-1 min-w-[180px] px-3 py-1.5 text-sm text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                />
                <select value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value); setPaginaActual(1); }} className={selectClass}>
                    <option value="todos">Todos los tipos</option>
                    <option value="jugador">Jugadores</option>
                    <option value="objeto">Objetos</option>
                </select>
                <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className={selectClass}>
                    <option value="nombre">Ordenar: Nombre</option>
                    <option value="rareza">Ordenar: Rareza</option>
                    <option value="puntos">Ordenar: Puntos</option>
                    <option value="equipo">Ordenar: Equipo</option>
                </select>
            </div>

            {/* ── Filtros de rareza ── */}
            <div className="flex flex-wrap gap-3 items-center mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rareza</span>
                {RAREZAS.map((rareza) => {
                    const colores: Record<string, string> = {
                        'Común': 'bg-slate-200 text-slate-700 border-slate-400',
                        'Raro': 'bg-blue-100 text-blue-700 border-blue-400',
                        'Épico': 'bg-purple-100 text-purple-700 border-purple-400',
                        'Legendario': 'bg-yellow-100 text-yellow-700 border-yellow-400',
                    };
                    const activo = filtroRareza.includes(rareza);
                    return (
                        <button
                            key={rareza}
                            onClick={() => { setFiltroRareza(rareza); setPaginaActual(1); }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all ${
                                activo
                                    ? colores[rareza] + ' opacity-100 scale-105'
                                    : 'bg-white dark:bg-gray-700 text-gray-500 border-gray-300 dark:border-gray-600 opacity-60'
                            }`}
                        >
                            {rareza}
                        </button>
                    );
                })}
            </div>

            {/* ── Filtros de jugador (posición, equipo) ── */}
            {mostrarJugador && (
                <div className="flex flex-wrap gap-2 items-center mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Jugadores</span>
                    <div className="flex items-center gap-1">
                        <label className="text-xs text-gray-500">Posición</label>
                        <select
                            value={filtroPosicion}
                            onChange={(e) => { setFiltroPosicion(e.target.value); setPaginaActual(1); }}
                            className={selectClass}
                        >
                            <option value="todos">Todas</option>
                            {POSICIONES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <label className="text-xs text-gray-500">Equipo</label>
                        <select
                            value={filtroEquipo}
                            onChange={(e) => { setFiltroEquipo(e.target.value); setPaginaActual(1); }}
                            className={selectClass}
                        >
                            {equiposUnicos.map(equipo => (
                                <option key={equipo} value={equipo}>
                                    {equipo === 'todos' ? 'Todos' : equipo}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* ── Filtros de puntos y jornada (solo jugadores) ── */}
            {mostrarJugador && (
                <div className="flex flex-wrap gap-2 items-center mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Puntos</span>
                    <div className="flex items-center gap-1">
                        <label className="text-xs text-gray-500">Jornada hasta</label>
                        <select
                            value={filtroJornada ?? ''}
                            onChange={(e) => setFiltroJornada(e.target.value ? parseInt(e.target.value) : null)}
                            className={selectClass}
                        >
                            <option value="">Todas (acumulado total)</option>
                            {jornadas.map(j => (
                                <option key={j.idJornada} value={j.idJornada}>{j.Nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <label className="text-xs text-gray-500">Mín. puntos</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={filtroMinPuntos}
                            onChange={(e) => setFiltroMinPuntos(e.target.value)}
                            className={`${selectClass} w-20`}
                        />
                    </div>
                </div>
            )}

            {/* ── Filtros de objeto (estadística, efecto) ── */}
            {mostrarObjeto && (
                <div className="flex flex-wrap gap-2 items-center mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Objetos</span>
                    <div className="flex items-center gap-1">
                        <label className="text-xs text-gray-500">Estadística</label>
                        <select
                            value={filtroEstadistica}
                            onChange={(e) => { setFiltroEstadistica(e.target.value); setPaginaActual(1); }}
                            className={selectClass}
                        >
                            {estadisticasUnicas.map(s => (
                                <option key={s} value={s}>{s === 'todos' ? 'Todas' : s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <label className="text-xs text-gray-500">Tipo efecto</label>
                        <select
                            value={filtroEfecto}
                            onChange={(e) => { setFiltroEfecto(e.target.value); setPaginaActual(1); }}
                            className={selectClass}
                        >
                            <option value="todos">Todos</option>
                            <option value="suma">Suma (+pts)</option>
                            <option value="multiplicador">Multiplicador (×)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* ── Barra inferior: resultados, paginación, vista, selección ── */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{cartas.length} cartas</span>
                    <button onClick={limpiarFiltros} className="text-xs text-red-500 hover:text-red-700 underline">
                        Limpiar filtros
                    </button>
                    <select
                        value={itemsPorPagina === Infinity ? 'Infinity' : itemsPorPagina}
                        onChange={handleItemsPorPaginaChange}
                        className={selectClass}
                    >
                        {itemsPorPaginaOptions.map(option => (
                            <option key={option} value={option === Infinity ? 'Infinity' : option}>
                                {option === Infinity ? 'Sin límite' : `${option} por página`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    {itemsPorPagina !== Infinity && totalPaginas > 1 && (
                        <>
                            <button onClick={handlePrevPage} disabled={paginaActual === 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-40 text-sm">‹</button>
                            <span className="text-sm">{paginaActual} / {totalPaginas}</span>
                            <button onClick={handleNextPage} disabled={paginaActual === totalPaginas} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-40 text-sm">›</button>
                        </>
                    )}
                    <button
                        onClick={handleToggleModoSeleccion}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            modoSeleccion
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white hover:bg-gray-300'
                        }`}
                    >
                        {modoSeleccion ? 'Cancelar selección' : 'Seleccionar varias'}
                    </button>
                    {onEliminarDuplicados && (
                        <button
                            onClick={onEliminarDuplicados}
                            title={`${countDuplicadosVendibles} cartas duplicadas vendibles`}
                            className="px-3 py-1 rounded text-sm font-medium bg-amber-100 text-amber-800 border border-amber-400 hover:bg-amber-200 transition-colors"
                        >
                            Vender duplicados {countDuplicadosVendibles > 0 && <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 text-xs">{countDuplicadosVendibles}</span>}
                        </button>
                    )}
                    {onEliminarComunesRepetidos && (
                        <button
                            onClick={onEliminarComunesRepetidos}
                            title={`${countDuplicadosComunes} cartas comunes repetidas`}
                            className="px-3 py-1 rounded text-sm font-medium bg-slate-100 text-slate-700 border border-slate-400 hover:bg-slate-200 transition-colors"
                        >
                            Limpiar comunes {countDuplicadosComunes > 0 && <span className="ml-1 bg-slate-500 text-white rounded-full px-1.5 text-xs">{countDuplicadosComunes}</span>}
                        </button>
                    )}
                    <button onClick={() => setIsGridView(true)} className={`px-3 py-1 rounded text-sm ${isGridView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'}`}>
                        Cuadrícula
                    </button>
                    <button onClick={() => setIsGridView(false)} className={`px-3 py-1 rounded text-sm ${!isGridView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'}`}>
                        Lista
                    </button>
                </div>
            </div>

            {mensaje && <p className="text-red-600 mb-2">{mensaje}</p>}

            {/* ── Grid o Lista ── */}
            {isGridView ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
                    {cartas.map((c, idx) => {
                        const seleccionada = seleccionadas.has(c.id);
                        const vendible = puedeVender(c);
                        return (
                            <div key={idx} className="relative">
                                {/* Overlay de selección */}
                                {modoSeleccion && (
                                    <div
                                        className={`absolute inset-0 z-10 rounded-xl cursor-pointer transition-all ${
                                            seleccionada
                                                ? 'bg-blue-500/30 ring-4 ring-blue-500'
                                                : vendible
                                                    ? 'hover:bg-blue-500/10 ring-2 ring-transparent hover:ring-blue-300'
                                                    : 'bg-gray-500/20 cursor-not-allowed'
                                        }`}
                                        onClick={() => toggleSeleccion(c)}
                                    >
                                        {seleccionada && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">✓</div>
                                        )}
                                        {!vendible && (
                                            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                                <span className="text-xs bg-gray-700/80 text-gray-300 px-2 py-0.5 rounded-full">No vendible</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {c.tipo === 'jugador'
                                    ? <AlbumPlayerCard carta={c} onDelete={eliminarCarta} />
                                    : <AlbumObjectCard carta={c} onDelete={eliminarCarta} />
                                }
                            </div>
                        );
                    })}
                </div>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 pb-24">
                    {cartas.map((c, idx) => {
                        const seleccionada = seleccionadas.has(c.id);
                        const vendible = puedeVender(c);
                        const valor = valorVentaCarta(c);
                        return (
                            <li
                                key={idx}
                                className={`py-2 flex justify-between items-center transition-colors ${
                                    modoSeleccion && vendible ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''
                                } ${seleccionada ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                onClick={() => modoSeleccion && toggleSeleccion(c)}
                            >
                                <div className="flex items-center gap-3">
                                    {modoSeleccion && (
                                        <input type="checkbox" readOnly checked={seleccionada} disabled={!vendible} className="w-4 h-4 accent-blue-500" />
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                        c.tipo === 'jugador' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                    }`}>{c.tipo === 'jugador' ? c.posicionFrontend ?? 'JUG' : 'OBJ'}</span>
                                    <div>
                                        <p className="font-semibold text-sm">{c.Nombre}</p>
                                        <p className="text-xs text-gray-400">
                                            {c.Rareza}
                                            {c.NombreEquipo ? ` · ${c.NombreEquipo}` : ''}
                                            {c.Estadistica ? ` · ${c.Estadistica}` : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {vendible && (
                                        <span className="text-xs text-gray-400 font-medium">{valor} 🏐</span>
                                    )}
                                    {!modoSeleccion && vendible && (
                                        <button className="text-xs text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); eliminarCarta(c); }}>
                                            Vender
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* ── Barra flotante de selección múltiple ── */}
            {modoSeleccion && seleccionadas.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 px-4 pointer-events-none">
                    <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 pointer-events-auto border border-gray-700 max-w-lg w-full">
                        <div className="flex-1">
                            <p className="font-bold text-sm">{seleccionadas.size} carta{seleccionadas.size !== 1 ? 's' : ''} seleccionada{seleccionadas.size !== 1 ? 's' : ''}</p>
                            <p className="text-green-400 text-sm font-semibold">+{totalBalones} 🏐 balones</p>
                        </div>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors"
                        >
                            Vender seleccionadas
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modal de confirmación de venta ── */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmar venta</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Vas a vender <span className="font-bold text-gray-900 dark:text-white">{seleccionadas.size} carta{seleccionadas.size !== 1 ? 's' : ''}</span> a cambio de <span className="font-bold text-green-600">{totalBalones} 🏐 balones</span>. Esta acción no se puede deshacer.
                        </p>

                        {/* Lista resumida */}
                        <ul className="max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 mb-4 text-sm">
                            {cartasSeleccionadasList.map((c, i) => (
                                <li key={i} className="py-1.5 flex justify-between items-center">
                                    <span className="text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{c.Nombre}</span>
                                    <span className="text-gray-500 text-xs">{c.Rareza} · {valorVentaCarta(c)} 🏐</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={vendiendo}
                                className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleVenderConfirmado}
                                disabled={vendiendo}
                                className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {vendiendo ? 'Vendiendo...' : 'Confirmar venta'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
