// src/app/ligas/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/auth-context';

// Define los tipos de datos que esperamos de las APIs
type Liga = {
    idLigas: number;
    Nombre: string;
    Codigo: string | null;
};

type Clasificacion = {
    idManager: number;
    nombreManager: string;
    puntuacion_actual: number;
};

// Componente del Modal para crear una liga
interface CreateLigaModalProps {
    show: boolean;
    onClose: () => void;
    onCreate: (nombreLiga: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const CreateLigaModal: React.FC<CreateLigaModalProps> = ({ 
    show, onClose, onCreate, isLoading, error
}) => {
    const [nombreLiga, setNombreLiga] = useState('');

    if (!show) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onCreate(nombreLiga);
        if (!error && !isLoading) {
             setNombreLiga('');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Crear Nueva Liga</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="nombreLiga" className="block text-sm font-medium text-gray-700">
                            Nombre de la liga
                        </label>
                        <input
                            type="text"
                            id="nombreLiga"
                            value={nombreLiga}
                            onChange={(e) => setNombreLiga(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            placeholder="Nombre de la liga"
                            required
                            disabled={isLoading}
                        />
                    </div>
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

// Nuevo Componente: Modal para unirse a una liga
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
        if (!error && !isLoading) {
            setCodigo('');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Unirse a Liga</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="codigoLiga" className="block text-sm font-medium text-gray-700">
                            Código de la liga
                        </label>
                        <input
                            type="text"
                            id="codigoLiga"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-900"
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
    const { user, manager } = useAuth();
    
    // Estados para la lista de ligas
    const [ligas, setLigas] = useState<Liga[]>([]);
    const [isLoadingLigas, setIsLoadingLigas] = useState(true);
    const [errorLigas, setErrorLigas] = useState<string | null>(null);

    // Estados para la clasificación de la liga seleccionada
    const [selectedLigaId, setSelectedLigaId] = useState<number | null>(null);
    const [clasificacion, setClasificacion] = useState<Clasificacion[]>([]);
    const [isLoadingClasificacion, setIsLoadingClasificacion] = useState(false);
    const [errorClasificacion, setErrorClasificacion] = useState<string | null>(null);

    // Estados para los modales y su lógica
    const [showCreateLigaModal, setShowCreateLigaModal] = useState(false);
    const [isLoadingCreate, setIsLoadingCreate] = useState(false);
    const [errorCreate, setErrorCreate] = useState<string | null>(null);

    // Nuevo estado para la lógica de unirse a liga
    const [showJoinLigaModal, setShowJoinLigaModal] = useState(false);
    const [isLoadingJoin, setIsLoadingJoin] = useState(false);
    const [errorJoin, setErrorJoin] = useState<string | null>(null);
    
    // Nuevo estado para mostrar el código de la liga
    const [showCodigo, setShowCodigo] = useState(false);
    const selectedLiga = ligas.find(l => l.idLigas === selectedLigaId);
    
    // useEffect para obtener la lista de ligas del usuario
    const fetchLigas = async () => {
        if (!manager?.idManager) return;
        try {
            setIsLoadingLigas(true);
            setErrorLigas(null);
            
            const response = await fetch(`/api/ligas/mis-ligas?managerId=${manager.idManager}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener las ligas');
            }
            
            const data = await response.json();
            setLigas(data.ligas);
            if (data.ligas.length > 0) {
                setSelectedLigaId(data.ligas[0].idLigas);
            }
        } catch (err) {
            console.error("Fallo al obtener las ligas:", err);
            setErrorLigas('Fallo al obtener las ligas. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoadingLigas(false);
        }
    };
    
    useEffect(() => {
        fetchLigas();
    }, [manager]);

    // useEffect para obtener la clasificación de la liga seleccionada
    useEffect(() => {
        if (selectedLigaId) {
            const fetchClasificacion = async () => {
                try {
                    setIsLoadingClasificacion(true);
                    setErrorClasificacion(null);
                    
                    const response = await fetch(`/api/ligas/${selectedLigaId}/clasificacion`);
                    
                    if (!response.ok) {
                        throw new Error('Error al obtener la clasificación');
                    }
                    
                    const data = await response.json();
                    setClasificacion(data.clasificacion);
                } catch (err) {
                    console.error("Fallo al obtener la clasificación:", err);
                    setErrorClasificacion('Fallo al obtener la clasificación. Por favor, inténtalo de nuevo.');
                } finally {
                    setIsLoadingClasificacion(false);
                }
            };

            fetchClasificacion();
        }
    }, [selectedLigaId]);

    // Lógica para el modal de creación de liga
    const handleCreateLiga = async (nombreLiga: string) => {
        if (!manager?.idManager) {
            setErrorCreate("No se pudo obtener el ID del manager. Por favor, recarga la página.");
            return;
        }

        setIsLoadingCreate(true);
        setErrorCreate(null);
        
        try {
            const response = await fetch('/api/ligas/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombreLiga, managerId: manager.idManager }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear la liga.');
            }
            
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

    // Lógica para unirse a una liga
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ codigo, managerId: manager.idManager }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al unirte a la liga.');
            }

            alert(data.message);
            await fetchLigas();
            setShowJoinLigaModal(false);

        } catch (err: any) {
            console.error("Fallo al unirse a la liga:", err);
            setErrorJoin(err.message);
        } finally {
            setIsLoadingJoin(false);
        }
    };
    
    // Función para copiar el código
    const copyToClipboard = () => {
        if (selectedLiga?.Codigo) {
            navigator.clipboard.writeText(selectedLiga.Codigo);
            alert('Código de unión copiado al portapapeles!');
        }
    };

    // Renderizado de carga y errores
    if (isLoadingLigas) {
        return <div className="text-center p-8 pt-[60px] text-gray-600">Cargando ligas...</div>;
    }

    if (errorLigas) {
        return (
            <div className="text-center p-8 pt-[60px] text-red-500 font-semibold">
                {errorLigas}
            </div>
        );
    }
    
    return (
        <div className="flex h-screen bg-gray-100 pt-[60px]">
            {/* Barra lateral izquierda para la lista de ligas */}
            <div className="w-1/4 bg-white p-4 border-r border-gray-200 shadow-md overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Mis Ligas</h2>
                {ligas.length === 0 ? (
                    <p className="text-gray-500">No participas en ninguna liga aún.</p>
                ) : (
                    <ul>
                        {ligas.map(liga => (
                            <li
                                key={liga.idLigas}
                                className={`p-3 cursor-pointer rounded-lg mb-2 transition-colors duration-200
                                    ${selectedLigaId === liga.idLigas ? 'bg-blue-600 text-white shadow-inner' : 'hover:bg-gray-200 text-gray-900'}`}
                                onClick={() => setSelectedLigaId(liga.idLigas)}
                            >
                                {liga.Nombre}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Área central para la clasificación de la liga y botones de acción */}
            <div className="flex-1 p-8 overflow-y-auto">
                {/* Botones de acción */}
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
                
                {/* Contenido de la clasificación */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {ligas.length > 0 && selectedLigaId ? (
                        <>
                            <div className="flex items-center space-x-4 mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Clasificación de la Liga: {selectedLiga?.Nombre}
                                </h1>
                                {selectedLiga?.Codigo && (
                                    <button
                                        onClick={() => setShowCodigo(!showCodigo)}
                                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full font-medium hover:bg-gray-300 transition-colors"
                                    >
                                        {showCodigo ? 'Ocultar Código' : 'Mostrar Código'}
                                    </button>
                                )}
                            </div>
                            
                            {showCodigo && selectedLiga?.Codigo && (
                                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 flex items-center justify-between">
                                    <p className="font-semibold text-lg">
                                        Código de Unión: <span className="font-mono text-xl ml-2">{selectedLiga.Codigo}</span>
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
                                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">Clasificación Total</h2>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white rounded-lg shadow-md">
                                            <thead>
                                                <tr>
                                                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Posición</th>
                                                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Manager</th>
                                                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">Puntuación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {clasificacion.map((manager, index) => (
                                                    <tr key={manager.idManager} className="hover:bg-gray-100">
                                                        <td className="py-2 px-4 border-b border-gray-200 text-gray-900">{index + 1}</td>
                                                        <td className="py-2 px-4 border-b border-gray-200 font-medium text-gray-900">{manager.nombreManager}</td>
                                                        <td className="py-2 px-4 border-b border-gray-200 font-bold text-gray-900">{manager.puntuacion_actual}</td>
                                                    </tr>
                                                ))}
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
            
            {/* Modal para crear una liga */}
            <CreateLigaModal
                show={showCreateLigaModal}
                onClose={() => setShowCreateLigaModal(false)}
                onCreate={handleCreateLiga}
                isLoading={isLoadingCreate}
                error={errorCreate}
            />

            {/* Modal para unirse a una liga */}
            <JoinLigaModal
                show={showJoinLigaModal}
                onClose={() => setShowJoinLigaModal(false)}
                onJoin={handleJoinLiga}
                isLoading={isLoadingJoin}
                error={errorJoin}
            />
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