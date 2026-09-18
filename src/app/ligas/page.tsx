'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RequireAuth from '@/components/ui/RequireAuth';
import Toast from '@/components/ui/Toast';
import PageLayout from '@/components/layout/PageLayout';
import { LeagueTableSkeleton } from '@/components/ui/CardSkeleton';
import { useLigas, Liga } from '@/hooks/useLigas';
import { cn } from '@/lib/utils';
import { Plus, Users, Copy, ChevronDown, Trophy } from 'lucide-react';

type Equipo = {
    idEquipo: number;
    Nombre: string;
};

const TipoBadge: React.FC<{ tipo: Liga['tipo'] }> = ({ tipo }) => {
    const styles: Record<string, string> = {
        general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        privada: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        club: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    };
    const labels: Record<string, string> = {
        general: 'General',
        privada: 'Privada',
        club: 'Club',
    };
    return (
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", styles[tipo] ?? styles.privada)}>
            {labels[tipo] ?? tipo}
        </span>
    );
};

interface CreateLigaModalProps {
    show: boolean;
    onClose: () => void;
    onCreate: (nombreLiga: string, tipo: 'privada' | 'club', idEquipo: number | null) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const CreateLigaModal: React.FC<CreateLigaModalProps> = ({ show, onClose, onCreate, isLoading, error }) => {
    const [nombreLiga, setNombreLiga] = useState('');
    const [tipo, setTipo] = useState<'privada' | 'club'>('privada');
    const [idEquipo, setIdEquipo] = useState<number | null>(null);
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [loadingEquipos, setLoadingEquipos] = useState(false);

    useEffect(() => {
        if (tipo === 'club' && equipos.length === 0) {
            setLoadingEquipos(true);
            fetch('/api/equipo')
                .then(r => r.json())
                .then(data => {
                    const lista = Array.isArray(data) ? data : (data.equipos ?? []);
                    setEquipos(lista);
                    if (lista.length > 0) setIdEquipo(lista[0].idEquipo);
                })
                .catch(console.error)
                .finally(() => setLoadingEquipos(false));
        }
    }, [tipo]);

    if (!show) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onCreate(nombreLiga, tipo, tipo === 'club' ? idEquipo : null);
    };

    return (
        <div className="fixed inset-0 bg-gray-600/60 dark:bg-black/70 flex items-end md:items-center justify-center z-50 md:p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-t-2xl md:rounded-xl shadow-xl w-full md:max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Crear Nueva Liga</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={nombreLiga}
                            onChange={(e) => setNombreLiga(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre de la liga"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as 'privada' | 'club')}
                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                            disabled={isLoading}
                        >
                            <option value="privada">Privada — puntuación estándar</option>
                            <option value="club">Club — jugadores del equipo puntúan x2</option>
                        </select>
                    </div>
                    {tipo === 'club' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipo</label>
                            {loadingEquipos ? (
                                <p className="text-sm text-gray-500">Cargando equipos...</p>
                            ) : (
                                <select
                                    value={idEquipo ?? ''}
                                    onChange={(e) => setIdEquipo(parseInt(e.target.value))}
                                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
                                    required
                                    disabled={isLoading}
                                >
                                    {equipos.map(eq => (
                                        <option key={eq.idEquipo} value={eq.idEquipo}>{eq.Nombre}</option>
                                    ))}
                                </select>
                            )}
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                Los jugadores de este equipo contarán el doble de puntos.
                            </p>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creando...' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface JoinLigaModalProps {
    show: boolean;
    onClose: () => void;
    onJoin: (codigo: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const JoinLigaModal: React.FC<JoinLigaModalProps> = ({ show, onClose, onJoin, isLoading, error }) => {
    const [codigo, setCodigo] = useState('');

    if (!show) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onJoin(codigo);
        if (!error && !isLoading) setCodigo('');
    };

    return (
        <div className="fixed inset-0 bg-gray-600/60 dark:bg-black/70 flex items-end md:items-center justify-center z-50 md:p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-t-2xl md:rounded-xl shadow-xl w-full md:max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Unirse a una Liga</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de la liga</label>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Introduce el código"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Uniéndote...' : 'Unirse'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LigasPageContent = () => {
    const {
        manager,
        ligas,
        isLoadingLigas,
        errorLigas,
        selectedLigaId,
        setSelectedLigaId,
        clasificacion,
        ligaInfo,
        isLoadingClasificacion,
        errorClasificacion,
        showCreateLigaModal,
        setShowCreateLigaModal,
        isLoadingCreate,
        errorCreate,
        showJoinLigaModal,
        setShowJoinLigaModal,
        isLoadingJoin,
        errorJoin,
        showCodigo,
        setShowCodigo,
        toast,
        setToast,
        selectedLiga,
        handleCreateLiga,
        handleJoinLiga,
        copyToClipboard,
    } = useLigas();

    if (isLoadingLigas) {
        return (
            <PageLayout centered>
                <div className="mt-8 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </PageLayout>
        );
    }

    if (errorLigas) {
        return (
            <PageLayout centered className="flex items-center justify-center">
                <p className="text-red-500 font-semibold">{errorLigas}</p>
            </PageLayout>
        );
    }

    return (
        <PageLayout noPadding>
            {/* Layout split: en móvil es columna, en desktop es fila */}
            <div className="flex flex-col md:flex-row md:h-[calc(100vh-60px)]">

                {/* ── Sidebar / Panel de ligas ── */}
                <aside className="w-full md:w-64 md:shrink-0 bg-white dark:bg-gray-800 border-b md:border-b-0 md:border-r border-border md:overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">Mis Ligas</h2>

                        {/* Botones de acción */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setShowCreateLigaModal(true)}
                                aria-label="Crear liga"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" aria-hidden="true" />
                                Crear
                            </button>
                            <button
                                onClick={() => setShowJoinLigaModal(true)}
                                aria-label="Unirse a una liga"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Users className="w-4 h-4" aria-hidden="true" />
                                Unirse
                            </button>
                        </div>

                        {/* Lista de ligas — en móvil es un select, en desktop es la lista */}
                        {ligas.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No participas en ninguna liga aún.
                            </p>
                        ) : (
                            <>
                                {/* Select visible solo en móvil */}
                                <div className="md:hidden">
                                    <label htmlFor="liga-select" className="text-xs text-muted-foreground mb-1 block">
                                        Seleccionar liga
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="liga-select"
                                            value={selectedLigaId ?? ''}
                                            onChange={(e) => setSelectedLigaId(parseInt(e.target.value))}
                                            className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-border rounded-lg px-3 py-2.5 pr-8 text-sm text-gray-900 dark:text-gray-100"
                                        >
                                            {ligas.map(liga => (
                                                <option key={liga.idLigas} value={liga.idLigas}>
                                                    {liga.Nombre} ({liga.tipo ?? 'privada'})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                                    </div>
                                </div>

                                {/* Lista visible solo en desktop */}
                                <ul className="hidden md:block space-y-1">
                                    {ligas.map(liga => (
                                        <li key={liga.idLigas}>
                                            <button
                                                className={cn(
                                                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
                                                    selectedLigaId === liga.idLigas
                                                        ? "bg-blue-600 text-white"
                                                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                )}
                                                onClick={() => setSelectedLigaId(liga.idLigas)}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="truncate font-medium">{liga.Nombre}</span>
                                                    <TipoBadge tipo={liga.tipo ?? 'privada'} />
                                                </div>
                                                {liga.tipo === 'club' && liga.NombreEquipo && (
                                                    <p className={cn(
                                                        "text-xs mt-0.5",
                                                        selectedLigaId === liga.idLigas ? "text-blue-100" : "text-muted-foreground"
                                                    )}>
                                                        {liga.NombreEquipo}
                                                    </p>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </aside>

                {/* ── Área principal ── */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
                    {ligas.length > 0 && selectedLigaId ? (
                        <div className="max-w-3xl mx-auto">
                            {/* Header de la liga */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {selectedLiga?.Nombre}
                                    </h1>
                                    {selectedLiga && <TipoBadge tipo={selectedLiga.tipo ?? 'privada'} />}
                                </div>

                                {(ligaInfo?.tipo === 'club' || selectedLiga?.tipo === 'club') && (
                                    <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 mb-3">
                                        Liga de club — los jugadores de{' '}
                                        <strong>{ligaInfo?.NombreEquipo ?? selectedLiga?.NombreEquipo}</strong>{' '}
                                        puntúan el doble.
                                    </p>
                                )}

                                {selectedLiga?.Codigo && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                            onClick={() => setShowCodigo(!showCodigo)}
                                            className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            {showCodigo ? 'Ocultar código' : 'Mostrar código'}
                                        </button>
                                        {showCodigo && (
                                            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-1.5">
                                                <span className="font-mono font-bold text-yellow-800 dark:text-yellow-300">
                                                    {selectedLiga.Codigo}
                                                </span>
                                                <button
                                                    onClick={copyToClipboard}
                                                    aria-label="Copiar código"
                                                    className="text-yellow-700 dark:text-yellow-400 hover:text-yellow-900 transition-colors"
                                                >
                                                    <Copy className="w-4 h-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Tabla de clasificación */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-border">
                                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Clasificación</h2>
                                </div>

                                {isLoadingClasificacion ? (
                                    <LeagueTableSkeleton rows={6} />
                                ) : errorClasificacion ? (
                                    <p className="text-red-500 p-4 text-sm">{errorClasificacion}</p>
                                ) : clasificacion.length === 0 ? (
                                    <p className="text-muted-foreground p-4 text-sm">Sin datos de clasificación aún.</p>
                                ) : (
                                    /* Desktop: tabla / Mobile: cards */
                                    <>
                                        {/* Desktop table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        <th className="py-2 px-4 text-left w-12">Pos.</th>
                                                        <th className="py-2 px-4 text-left">Manager</th>
                                                        <th className="py-2 px-4 text-right">Puntos</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {clasificacion.map((m, index) => {
                                                        const esYo = m.idManager === manager?.idManager;
                                                        return (
                                                            <tr
                                                                key={m.idManager}
                                                                className={cn(
                                                                    "transition-colors",
                                                                    esYo ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                                )}
                                                            >
                                                                <td className="py-3 px-4 text-sm text-muted-foreground font-medium">
                                                                    {index + 1}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Link
                                                                            href={`/equipo/${m.idManager}?nombre=${encodeURIComponent(m.nombreManager)}`}
                                                                            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline hover:text-blue-600 transition-colors"
                                                                        >
                                                                            {m.nombreManager}
                                                                        </Link>
                                                                        {esYo && <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">(tú)</span>}
                                                                        {!!m.isBot && <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">BOT</span>}
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-gray-100">
                                                                    {m.puntuacion_actual}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile cards */}
                                        <div className="md:hidden divide-y divide-border">
                                            {clasificacion.map((m, index) => {
                                                const esYo = m.idManager === manager?.idManager;
                                                return (
                                                    <div
                                                        key={m.idManager}
                                                        className={cn(
                                                            "flex items-center gap-3 px-4 py-3",
                                                            esYo && "bg-blue-50 dark:bg-blue-900/20"
                                                        )}
                                                    >
                                                        {/* Posición */}
                                                        <span className={cn(
                                                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                            index === 0 ? "bg-yellow-400 text-yellow-900" :
                                                            index === 1 ? "bg-gray-300 text-gray-700" :
                                                            index === 2 ? "bg-amber-600 text-white" :
                                                            "bg-gray-100 dark:bg-gray-700 text-muted-foreground"
                                                        )}>
                                                            {index + 1}
                                                        </span>
                                                        {/* Manager */}
                                                        <div className="flex-1 min-w-0">
                                                            <Link
                                                                href={`/equipo/${m.idManager}?nombre=${encodeURIComponent(m.nombreManager)}`}
                                                                className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block hover:underline"
                                                            >
                                                                {m.nombreManager}
                                                            </Link>
                                                            <div className="flex gap-1 mt-0.5">
                                                                {esYo && <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">tú</span>}
                                                                {!!m.isBot && <span className="text-xs bg-gray-200 dark:bg-gray-600 text-muted-foreground px-1 rounded">BOT</span>}
                                                            </div>
                                                        </div>
                                                        {/* Puntos */}
                                                        <span className="font-bold text-gray-900 dark:text-gray-100 shrink-0 text-base">
                                                            {m.puntuacion_actual}
                                                            <span className="text-xs text-muted-foreground font-normal ml-1">pts</span>
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                            <Trophy className="w-12 h-12 text-muted-foreground mb-3" aria-hidden="true" />
                            <p className="text-muted-foreground text-sm">
                                {ligas.length === 0
                                    ? "Crea o únete a una liga para empezar."
                                    : "Selecciona una liga para ver su clasificación."}
                            </p>
                        </div>
                    )}
                </main>
            </div>

            <CreateLigaModal
                show={showCreateLigaModal}
                onClose={() => setShowCreateLigaModal(false)}
                onCreate={handleCreateLiga}
                isLoading={isLoadingCreate}
                error={errorCreate}
            />
            <JoinLigaModal
                show={showJoinLigaModal}
                onClose={() => setShowJoinLigaModal(false)}
                onJoin={handleJoinLiga}
                isLoading={isLoadingJoin}
                error={errorJoin}
            />
            {toast && (
                <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
            )}
        </PageLayout>
    );
};

export default function LigasPage() {
    return (
        <RequireAuth>
            <LigasPageContent />
        </RequireAuth>
    );
}
