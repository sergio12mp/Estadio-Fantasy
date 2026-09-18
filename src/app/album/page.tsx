'use client';

import RequireAuth from '@/components/ui/RequireAuth';
import AlbumView from '@/components/album/AlbumView';
import AlbumProgress from '@/components/album/AlbumProgress';
import PageLayout from '@/components/layout/PageLayout';
import { useAlbum } from '@/hooks/useAlbum';
import { cn } from '@/lib/utils';

const RAREZAS = ['Común', 'Raro', 'Épico', 'Legendario'];

const RAREZA_BADGE: Record<string, string> = {
    'Común': 'bg-slate-100 text-slate-700 border-slate-400',
    'Raro': 'bg-blue-100 text-blue-700 border-blue-400',
    'Épico': 'bg-purple-100 text-purple-700 border-purple-400',
    'Legendario': 'bg-yellow-100 text-yellow-700 border-yellow-400',
};

const ITEMS_POR_PAGINA_OPTIONS = [8, 16, 32, 64, 128, 256, Infinity];

export default function AlbumPage() {
    const {
        cartas,
        currency,
        activeTab,
        setActiveTab,
        tiendaLoaded,
        tiendaBusqueda,
        setTiendaBusqueda,
        tiendaTipo,
        setTiendaTipo,
        tiendaRareza,
        setTiendaRareza,
        tiendaComprandoKey,
        tiendaToast,
        tiendaItemsFiltrados,
        handleComprar,
        filtroTipoAlbum,
        setFiltroTipoAlbum,
        filtroRareza,
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
        busqueda,
        setBusqueda,
        mensaje,
        ordenarPor,
        setOrdenarPor,
        jornadas,
        paginaActual,
        setPaginaActual,
        itemsPorPagina,
        setItemsPorPagina,
        cartasPaginadas,
        totalPaginas,
        equiposUnicos,
        estadisticasUnicas,
        duplicadosVendibles,
        duplicadosComunes,
        showConfirmDuplicados,
        setShowConfirmDuplicados,
        procesandoDuplicados,
        toastVenta,
        eliminarCarta,
        venderMultiple,
        handleConfirmarDuplicados,
        handleRarezaChange,
        limpiarFiltros,
    } = useAlbum();

    return (
        <RequireAuth>
            <PageLayout centered>
                <h1 className="text-xl md:text-2xl font-bold mt-4 mb-3">Álbum de cartas</h1>
                <AlbumProgress cartas={cartas} />

                {/* ── Tabs ── */}
                <div className="flex gap-1 mb-5 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('album')}
                        className={cn(
                            "px-4 md:px-5 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors",
                            activeTab === 'album'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        )}
                    >
                        Mi Álbum
                    </button>
                    <button
                        onClick={() => setActiveTab('tienda')}
                        className={cn(
                            "px-4 md:px-5 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors",
                            activeTab === 'tienda'
                                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        )}
                    >
                        🛒 Tienda
                    </button>
                </div>

                {/* ── Tienda ── */}
                {activeTab === 'tienda' && (
                    <div>
                        <div className="flex flex-wrap gap-2 items-center mb-3">
                            <input
                                type="text"
                                placeholder="Buscar jugador, objeto, equipo..."
                                value={tiendaBusqueda}
                                onChange={(e) => setTiendaBusqueda(e.target.value)}
                                className="flex-1 min-w-[150px] px-3 py-1.5 text-sm text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                            />
                            <select
                                value={tiendaTipo}
                                onChange={(e) => setTiendaTipo(e.target.value as any)}
                                className="bg-white text-black dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm"
                            >
                                <option value="todos">Todos</option>
                                <option value="jugador">Jugadores</option>
                                <option value="objeto">Objetos</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rareza</span>
                            {RAREZAS.map((r) => {
                                const activo = tiendaRareza.includes(r);
                                return (
                                    <button
                                        key={r}
                                        onClick={() => setTiendaRareza(prev => activo ? prev.filter(x => x !== r) : [...prev, r])}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all",
                                            activo ? RAREZA_BADGE[r] + ' opacity-100 scale-105' : 'bg-white dark:bg-gray-700 text-gray-500 border-gray-300 dark:border-gray-600 opacity-60'
                                        )}
                                    >
                                        {r}
                                    </button>
                                );
                            })}
                            {(tiendaBusqueda || tiendaTipo !== 'todos' || tiendaRareza.length > 0) && (
                                <button onClick={() => { setTiendaBusqueda(''); setTiendaTipo('todos'); setTiendaRareza([]); }} className="text-xs text-red-500 underline ml-1">
                                    Limpiar
                                </button>
                            )}
                            <span className="ml-auto text-xs text-gray-400">{tiendaItemsFiltrados.length} artículos</span>
                        </div>

                        {!tiendaLoaded ? (
                            <p className="text-center text-gray-500 py-12">Cargando tienda...</p>
                        ) : (
                            /* 2 cols en móvil, 3 en sm, 4 en md+ */
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {tiendaItemsFiltrados.map((item) => {
                                    const rarezaBadge = RAREZA_BADGE[item.Rareza] ?? 'bg-gray-100 text-gray-700 border-gray-300';
                                    const itemKey = `${item.tipo}-${item.id}-${item.rarezaDB ?? item.Rareza}`;
                                    const comprando = tiendaComprandoKey === itemKey;
                                    const sinBalones = currency.balones < item.precioBalones;
                                    const sinOro = currency.oro < item.precioOro;
                                    return (
                                        <div key={itemKey} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-2.5 flex flex-col gap-2">
                                            <div className="flex items-start justify-between gap-1">
                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", rarezaBadge)}>{item.Rareza}</span>
                                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", item.tipo === 'jugador' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700')}>
                                                    {item.tipo === 'jugador' ? (item.Posicion ?? 'JUG') : 'OBJ'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100 text-xs leading-tight truncate">{item.Nombre}</p>
                                                {item.NombreEquipo && <p className="text-[10px] text-gray-400 truncate">{item.NombreEquipo}</p>}
                                                {item.Descripcion && <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{item.Descripcion}</p>}
                                            </div>
                                            <div className="mt-auto space-y-1.5">
                                                <div className="flex justify-between text-[10px] text-gray-500">
                                                    <span className="font-semibold text-amber-600">{item.precioBalones.toLocaleString()} 🏐</span>
                                                    <span className="font-semibold text-yellow-600">{item.precioOro.toLocaleString()} 🥇</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleComprar(item, 'balones')}
                                                        disabled={comprando || sinBalones}
                                                        className="flex-1 py-1.5 bg-amber-500 text-white text-[10px] font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {comprando ? '...' : sinBalones ? 'Sin 🏐' : '🏐'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleComprar(item, 'oro')}
                                                        disabled={comprando || sinOro}
                                                        className="flex-1 py-1.5 bg-yellow-500 text-white text-[10px] font-semibold rounded-lg hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {comprando ? '...' : sinOro ? 'Sin 🥇' : '🥇'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Álbum ── */}
                {activeTab === 'album' && (
                    <AlbumView
                        cartas={cartasPaginadas}
                        eliminarCarta={eliminarCarta}
                        venderMultiple={venderMultiple}
                        filtroTipo={filtroTipoAlbum}
                        setFiltroTipo={setFiltroTipoAlbum}
                        filtroRareza={filtroRareza}
                        setFiltroRareza={handleRarezaChange}
                        filtroEquipo={filtroEquipo}
                        setFiltroEquipo={setFiltroEquipo}
                        filtroPosicion={filtroPosicion}
                        setFiltroPosicion={setFiltroPosicion}
                        filtroEstadistica={filtroEstadistica}
                        setFiltroEstadistica={setFiltroEstadistica}
                        filtroEfecto={filtroEfecto}
                        setFiltroEfecto={setFiltroEfecto}
                        filtroJornada={filtroJornada}
                        setFiltroJornada={setFiltroJornada}
                        filtroMinPuntos={filtroMinPuntos}
                        setFiltroMinPuntos={setFiltroMinPuntos}
                        jornadas={jornadas}
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        mensaje={mensaje}
                        ordenarPor={ordenarPor}
                        setOrdenarPor={setOrdenarPor}
                        equiposUnicos={equiposUnicos}
                        estadisticasUnicas={estadisticasUnicas}
                        limpiarFiltros={limpiarFiltros}
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        itemsPorPagina={itemsPorPagina}
                        setPaginaActual={setPaginaActual}
                        setItemsPorPagina={setItemsPorPagina}
                        itemsPorPaginaOptions={ITEMS_POR_PAGINA_OPTIONS}
                        onEliminarDuplicados={duplicadosVendibles.length > 0
                            ? () => setShowConfirmDuplicados({ tipo: 'vendibles', cartas: duplicadosVendibles })
                            : undefined}
                        onEliminarComunesRepetidos={duplicadosComunes.length > 0
                            ? () => setShowConfirmDuplicados({ tipo: 'comunes', cartas: duplicadosComunes })
                            : undefined}
                        countDuplicadosVendibles={duplicadosVendibles.length}
                        countDuplicadosComunes={duplicadosComunes.length}
                    />
                )}
            </PageLayout>

            {/* Modal confirmación duplicados */}
            {showConfirmDuplicados && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 md:p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {showConfirmDuplicados.tipo === 'vendibles' ? 'Vender duplicados' : 'Eliminar comunes repetidos'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {showConfirmDuplicados.tipo === 'vendibles'
                                ? `Se venderán ${showConfirmDuplicados.cartas.length} cartas duplicadas (no comunes).`
                                : `Se eliminarán ${showConfirmDuplicados.cartas.length} cartas comunes repetidas.`
                            }
                        </p>
                        <ul className="max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 mb-4 text-sm">
                            {showConfirmDuplicados.cartas.map((c, i) => (
                                <li key={i} className="py-1.5 flex justify-between items-center">
                                    <span className="text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{c.Nombre}</span>
                                    <span className="text-gray-500 text-xs shrink-0 ml-2">{c.Rareza}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDuplicados(null)}
                                disabled={procesandoDuplicados}
                                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarDuplicados}
                                disabled={procesandoDuplicados}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {procesandoDuplicados ? 'Procesando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastVenta && (
                <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-bounce">
                    {toastVenta}
                </div>
            )}
            {tiendaToast && (
                <div className={cn(
                    "fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-bounce text-white",
                    tiendaToast.startsWith('✅') ? 'bg-green-600' : 'bg-red-600'
                )}>
                    {tiendaToast}
                </div>
            )}
        </RequireAuth>
    );
}
