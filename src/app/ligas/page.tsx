// src/app/ligas/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/auth-context';
import Toast from '@/components/Toast';

type Liga = {
    idLigas: number;
    Nombre: string;
    Codigo: string | null;
    tipo: 'general' | 'privada' | 'club';
    idEquipo: number | null;
    NombreEquipo: string | null;
};

type Clasificacion = {
    idManager: number;
    nombreManager: string;
    puntuacion_actual: number;
};

type Equipo = {
    idEquipo: number;
    Nombre: string;
};

// Badge de tipo de liga
const TipoBadge: React.FC<{ tipo: Liga['tipo'] }> = ({ tipo }) => {
    const styles: Record<string, string> = {
        general: 'bg-blue-100 text-blue-700',
        privada: 'bg-gray-100 text-gray-700',
        club: 'bg-amber-100 text-amber-700',
    };
    const labels: Record<string, string> = {
        general: 'General',
        privada: 'Privada',
        club: 'Club',
    };
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[tipo] ?? styles.privada}`}>
            {labels[tipo] ?? tipo}
        </span>
    );
};

// Modal para crear una liga
interface CreateLigaModalProps {
    show: boolean;
    onClose: () => void;
    onCreate: (nombreLiga: string, tipo: 'privada' | 'club', idEquipo: number | null) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const CreateLigaModal: React.FC<CreateLigaModalProps> = ({
    show, onClose, onCreate, isLoading, error
}) => {
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Crear Nueva Liga</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la liga
                        </label>
                        <input
                            type="text"
                            value={nombreLiga}
                            onChange={(e) => setNombreLiga(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            placeholder="Nombre de la liga"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de liga
                        </label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as 'privada' | 'club')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            disabled={isLoading}
                        >
                            <option value="privada">Privada — puntuación estándar</option>
                            <option value="club">Club — jugadores del equipo puntúan x2</option>
                        </select>
                    </div>
                    {tipo === 'club' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Equipo de la liga
                            </label>
                            {loadingEquipos ? (
                                <p className="text-sm text-gray-500">Cargando equipos...</p>
                            ) : (
                                <select
                                    value={idEquipo ?? ''}
                                    onChange={(e) => setIdEquipo(parseInt(e.target.value))}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-gray-900"
                                    required
                                    disabled={isLoading}
                                >
                                    {equipos.map(eq => (
                                        <option key={eq.idEquipo} value={eq.idEquipo}>{eq.Nombre}</option>
                                    ))}
                                </select>
                            )}
                            <p className="text-xs text-amber-600 mt-1">
                                Los jugadores de este equipo contarán el doble de puntos en esta liga.
                            </p>
                        </div>
                    )}
                    {isLoading && <p className="text-blue-500 text-sm mb-2">Creando liga...</p>}
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            disabled={isLoading}
                        >
                            Crear
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal para unirse a una liga
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Unirse a Liga</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código de la liga
                        </label>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900"
                            placeholder="Introduce el código de la liga"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {isLoading && <p className="text-green-500 text-sm mb-2">Uniéndote a la liga...</p>}
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                            disabled={isLoading}
                        >
                            Unirse
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LigasPageContent = () => {
    const { manager } = useAuth();

    const [ligas, setLigas] = useState<Liga[]>([]);
    const [isLoadingLigas, setIsLoadingLigas] = useState(true);
    const [errorLigas, setErrorLigas] = useState<string | null>(null);

    const [selectedLigaId, setSelectedLigaId] = useState<number | null>(null);
    const [clasificacion, setClasificacion] = useState<Clasificacion[]>([]);
    const [ligaInfo, setLigaInfo] = useState<{ tipo: string; NombreEquipo: string | null } | null>(null);
    const [isLoadingClasificacion, setIsLoadingClasificacion] = useState(false);
    const [errorClasificacion, setErrorClasificacion] = useState<string | null>(null);

    const [showCreateLigaModal, setShowCreateLigaModal] = useState(false);
    const [isLoadingCreate, setIsLoadingCreate] = useState(false);
    const [errorCreate, setErrorCreate] = useState<string | null>(null);

    const [showJoinLigaModal, setShowJoinLigaModal] = useState(false);
    const [isLoadingJoin, setIsLoadingJoin] = useState(false);
    const [errorJoin, setErrorJoin] = useState<string | null>(null);

    const [showCodigo, setShowCodigo] = useState(false);
    const selectedLiga = ligas.find(l => l.idLigas === selectedLigaId);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const fetchLigas = async () => {
        if (!manager?.idManager) return;
        try {
            setIsLoadingLigas(true);
            setErrorLigas(null);
            const response = await fetch(`/api/ligas/mis-ligas?managerId=${manager.idManager}`);
            if (!response.ok) throw new Error('Error al obtener las ligas');
            const data = await response.json();
            setLigas(data.ligas);
            if (data.ligas.length > 0) setSelectedLigaId(data.ligas[0].idLigas);
        } catch (err) {
            console.error("Fallo al obtener las ligas:", err);
            setErrorLigas('Fallo al obtener las ligas. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoadingLigas(false);
        }
    };

    useEffect(() => { fetchLigas(); }, [manager]);

    useEffect(() => {
        if (!selectedLigaId) return;
        const fetchClasificacion = async () => {
            try {
                setIsLoadingClasificacion(true);
                setErrorClasificacion(null);
                const response = await fetch(`/api/ligas/${selectedLigaId}/clasificacion`);
                if (!response.ok) throw new Error('Error al obtener la clasificación');
                const data = await response.json();
                setClasificacion(data.clasificacion);
                setLigaInfo(data.liga ?? null);
            } catch (err) {
                console.error("Fallo al obtener la clasificación:", err);
                setErrorClasificacion('Fallo al obtener la clasificación. Por favor, inténtalo de nuevo.');
            } finally {
                setIsLoadingClasificacion(false);
            }
        };
        fetchClasificacion();
    }, [selectedLigaId]);

    const handleCreateLiga = async (nombreLiga: string, tipo: 'privada' | 'club', idEquipo: number | null) => {
        if (!manager?.idManager) {
            setErrorCreate("No se pudo obtener el ID del manager. Por favor, recarga la página.");
            return;
        }
        setIsLoadingCreate(true);
        setErrorCreate(null);
        try {
            const response = await fetch('/api/ligas/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreLiga, managerId: manager.idManager, tipo, idEquipo }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al crear la liga.');
            await fetchLigas();
            setSelectedLigaId(data.liga.idLigas);
            setShowCreateLigaModal(false);
        } catch (err: any) {
            console.error("Fallo al crear la liga:", err);
            setErrorCreate(err.message);
        } finally {
            setIsLoadingCreate(false);
        }
    };

    const handleJoinLiga = async (codigo: string) => {
        if (!manager?.idManager) {
            setErrorJoin("No se pudo obtener el ID del manager. Por favor, recarga la página.");
            return;
        }
        setIsLoadingJoin(true);
        setErrorJoin(null);
        try {
            const response = await fetch('/api/ligas/unirse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo, managerId: manager.idManager }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al unirte a la liga.');
            setToast({ message: data.message || '¡Te has unido a la liga!', type: 'success' });
            await fetchLigas();
            setShowJoinLigaModal(false);
        } catch (err: any) {
            console.error("Fallo al unirse a la liga:", err);
            setErrorJoin(err.message);
        } finally {
            setIsLoadingJoin(false);
        }
    };

    const copyToClipboard = () => {
        if (selectedLiga?.Codigo) {
            navigator.clipboard.writeText(selectedLiga.Codigo);
            setToast({ message: 'Código copiado al portapapeles', type: 'info' });
        }
    };

    if (isLoadingLigas) {
        return <div className="text-center p-8 pt-[60px] text-gray-600">Cargando ligas...</div>;
    }

    if (errorLigas) {
        return <div className="text-center p-8 pt-[60px] text-red-500 font-semibold">{errorLigas}</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 pt-[60px]">
            {/* Sidebar */}
            <div className="w-1/4 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 shadow-md overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Mis Ligas</h2>
                {ligas.length === 0 ? (
                    <p className="text-gray-500">No participas en ninguna liga aún.</p>
                ) : (
                    <ul>
                        {ligas.map(liga => (
                            <li
                                key={liga.idLigas}
                                className={`p-3 cursor-pointer rounded-lg mb-2 transition-colors duration-200
                                    ${selectedLigaId === liga.idLigas ? 'bg-blue-600 text-white shadow-inner' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
                                onClick={() => setSelectedLigaId(liga.idLigas)}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate">{liga.Nombre}</span>
                                    <TipoBadge tipo={liga.tipo ?? 'privada'} />
                                </div>
                                {liga.tipo === 'club' && liga.NombreEquipo && (
                                    <p className={`text-xs mt-0.5 ${selectedLigaId === liga.idLigas ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {liga.NombreEquipo}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Área principal */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-start space-x-4 mb-6">
                    <button
                        onClick={() => setShowCreateLigaModal(true)}
                        className="bg-blue-500 text-white p-2 rounded-md font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Crear Liga
                    </button>
                    <button
                        onClick={() => setShowJoinLigaModal(true)}
                        className="bg-green-500 text-white p-2 rounded-md font-semibold hover:bg-green-600 transition-colors"
                    >
                        Unirse a Liga
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    {ligas.length > 0 && selectedLigaId ? (
                        <>
                            <div className="flex items-center space-x-4 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {selectedLiga?.Nombre}
                                </h1>
                                {selectedLiga && <TipoBadge tipo={selectedLiga.tipo ?? 'privada'} />}
                                {selectedLiga?.Codigo && (
                                    <button
                                        onClick={() => setShowCodigo(!showCodigo)}
                                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full font-medium hover:bg-gray-300 transition-colors"
                                    >
                                        {showCodigo ? 'Ocultar Código' : 'Mostrar Código'}
                                    </button>
                                )}
                            </div>

                            {/* Info de liga de club */}
                            {(ligaInfo?.tipo === 'club' || selectedLiga?.tipo === 'club') && (
                                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
                                    Liga de club — los jugadores de <strong>{ligaInfo?.NombreEquipo ?? selectedLiga?.NombreEquipo}</strong> puntúan el doble.
                                </p>
                            )}

                            {showCodigo && selectedLiga?.Codigo && (
                                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 flex items-center justify-between">
                                    <p className="font-semibold text-lg">
                                        Código: <span className="font-mono text-xl ml-2">{selectedLiga.Codigo}</span>
                                    </p>
                                    <button
                                        onClick={copyToClipboard}
                                        className="ml-4 p-2 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition-colors"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            )}

                            {isLoadingClasificacion ? (
                                <p className="text-gray-600">Cargando clasificación...</p>
                            ) : errorClasificacion ? (
                                <p className="text-red-500 font-semibold">{errorClasificacion}</p>
                            ) : clasificacion.length === 0 ? (
                                <p className="text-gray-600">No hay datos de clasificación para esta liga aún.</p>
                            ) : (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Clasificación</h2>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                            <thead>
                                                <tr>
                                                    <th className="py-2 px-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Pos.</th>
                                                    <th className="py-2 px-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Manager</th>
                                                    <th className="py-2 px-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Puntos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {clasificacion.map((m, index) => {
                                                    const esYo = m.idManager === manager?.idManager;
                                                    return (
                                                    <tr key={m.idManager} className={esYo ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}>
                                                        <td className="py-2 px-4 border-b dark:border-gray-700 text-gray-900 dark:text-gray-200">{index + 1}</td>
                                                        <td className="py-2 px-4 border-b dark:border-gray-700 font-medium text-gray-900 dark:text-gray-200">
                                                            {m.nombreManager}
                                                            {esYo && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">(tú)</span>}
                                                        </td>
                                                        <td className="py-2 px-4 border-b dark:border-gray-700 font-bold text-gray-900 dark:text-gray-200">{m.puntuacion_actual}</td>
                                                    </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-600">Selecciona una liga de la izquierda para ver su clasificación.</p>
                    )}
                </div>
            </div>

            <CreateLigaModal
                show={showCreateLigaModal}
                onClose={() => { setShowCreateLigaModal(false); setErrorCreate(null); }}
                onCreate={handleCreateLiga}
                isLoading={isLoadingCreate}
                error={errorCreate}
            />

            <JoinLigaModal
                show={showJoinLigaModal}
                onClose={() => { setShowJoinLigaModal(false); setErrorJoin(null); }}
                onJoin={handleJoinLiga}
                isLoading={isLoadingJoin}
                error={errorJoin}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default function LigasPage() {
    return (
        <RequireAuth>
            <LigasPageContent />
        </RequireAuth>
    );
}
