'use client';

import { useState } from 'react';
import AlbumPlayerCard from './AlbumPlayerCard';
import AlbumObjectCard from './AlbumObjectCard';
import { CartaJugadorEnPlantilla } from '@/lib/data';

interface Carta {
    tipo: 'jugador' | 'objeto';
    Rareza: string;
    Nombre: string;
    NombreEquipo?: string;
    id: number;
    cantidad?: number;
    Puntos?: number;
    idObjetos?: number;
}

interface AlbumViewProps {
    cartas: Carta[];
    eliminarCarta: (carta: Carta) => void;
    filtroTipo: string;
    setFiltroTipo: (tipo: string) => void;
    filtroRareza: string[];
    setFiltroRareza: (rareza: string) => void;
    filtroEquipo: string;
    setFiltroEquipo: (equipo: string) => void;
    busqueda: string;
    setBusqueda: (busqueda: string) => void;
    mensaje: string;
    ordenarPor: string;
    setOrdenarPor: (orden: string) => void;
    equiposUnicos: string[];
    paginaActual: number;
    totalPaginas: number;
    itemsPorPagina: number;
    setPaginaActual: (pagina: number) => void;
    setItemsPorPagina: (items: number) => void;
    itemsPorPaginaOptions: number[];
}

const RAREZAS = ['Común', 'Raro', 'Épico', 'Legendario'];

export default function AlbumView({
    cartas,
    eliminarCarta,
    filtroTipo,
    setFiltroTipo,
    filtroRareza,
    setFiltroRareza,
    filtroEquipo,
    setFiltroEquipo,
    busqueda,
    setBusqueda,
    mensaje,
    ordenarPor,
    setOrdenarPor,
    equiposUnicos,
    paginaActual,
    totalPaginas,
    itemsPorPagina,
    setPaginaActual,
    setItemsPorPagina,
    itemsPorPaginaOptions,
}: AlbumViewProps) {
    const [isGridView, setIsGridView] = useState(true);

    const handleNextPage = () => {
        setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
    };

    const handlePrevPage = () => {
        setPaginaActual(prev => Math.max(prev - 1, 1));
    };

    const handleItemsPorPaginaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setItemsPorPagina(value === 'Infinity' ? Infinity : Number(value));
        setPaginaActual(1);
    };

    return (
        <>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-wrap gap-2 items-center">
                    <label className="font-semibold text-sm">Tipo:</label>
                    <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="bg-white text-black dark:bg-gray-800 dark:text-white">
                        <option value="todos">Todos</option>
                        <option value="jugador">Jugadores</option>
                        <option value="objeto">Objetos</option>
                    </select>

                    <label className="font-semibold text-sm">Equipo:</label>
                    <select value={filtroEquipo} onChange={(e) => setFiltroEquipo(e.target.value)} className="bg-white text-black dark:bg-gray-800 dark:text-white">
                        {equiposUnicos.map(equipo => (
                            <option key={equipo} value={equipo}>
                                {equipo === 'todos' ? 'Todos los equipos' : equipo}
                            </option>
                        ))}
                    </select>

                    <label className="font-semibold text-sm">Ordenar por:</label>
                    <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="bg-white text-black dark:bg-gray-800 dark:text-white">
                        <option value="nombre">Nombre</option>
                        <option value="puntos">Puntos</option>
                        <option value="rareza">Rareza</option>
                        <option value="equipo">Equipo</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Buscar por jugador o equipo"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="flex-1 px-2 py-1 text-black dark:text-white bg-white dark:bg-gray-800"
                    />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <label className="font-semibold text-sm">Rareza:</label>
                    {RAREZAS.map((rareza) => (
                        <div key={rareza} className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                id={rareza}
                                checked={filtroRareza.includes(rareza)}
                                onChange={() => setFiltroRareza(rareza)}
                                className="text-black"
                            />
                            <label htmlFor={rareza} className="text-sm">{rareza}</label>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                        <label className="text-sm">Mostrar:</label>
                        <select
                            value={itemsPorPagina === Infinity ? 'Infinity' : itemsPorPagina}
                            onChange={handleItemsPorPaginaChange}
                            className="bg-white text-black dark:bg-gray-800 dark:text-white"
                        >
                            {itemsPorPaginaOptions.map(option => (
                                <option key={option} value={option === Infinity ? 'Infinity' : option}>
                                    {option === Infinity ? 'Sin límite' : option}
                                </option>
                            ))}
                        </select>
                    </div>
                    {itemsPorPagina !== Infinity && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={paginaActual === 1}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <span className="text-sm">
                                Página {paginaActual} de {totalPaginas}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={paginaActual === totalPaginas}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 self-end">
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`p-2 rounded-md ${isGridView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                    >
                        Cuadrícula
                    </button>
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`p-2 rounded-md ${!isGridView ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                    >
                        Lista
                    </button>
                </div>
            </div>

            {mensaje && <p className="text-red-600 mb-2">{mensaje}</p>}

            {isGridView ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cartas.map((c, idx) => {
                        if (c.tipo === 'jugador') {
                            const cartaJugador: CartaJugadorEnPlantilla = {
                                idCartaJugador: c.id,
                                Rareza: c.Rareza,
                                NombreJugador: c.Nombre,
                                NombreEquipo: c.NombreEquipo,
                                Puntos: c.Puntos,
                                PosicionFrontend: 'DEL',
                                Edad: 0,
                                Pais: 'Desconocido',
                                maxObjetosSlots: 0,
                                objetosEquipados: [],
                            };
                            return (
                                <div key={idx}>
                                    <AlbumPlayerCard
                                        carta={cartaJugador}
                                        onDelete={eliminarCarta}
                                    />
                                </div>
                            );
                        } else if (c.tipo === 'objeto') {
                            // Se crea un nuevo objeto para garantizar que tenga la propiedad idObjetos
                            const cartaObjeto = {
                                ...c,
                                id: c.idObjetos,
                            };
                            return (
                                <div key={idx}>
                                    <AlbumObjectCard
                                        carta={cartaObjeto}
                                        onDelete={eliminarCarta}
                                    />
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            ) : (
                <ul className="list-disc pl-5">
                    {cartas.map((c, idx) => (
                        <li key={idx} className="mb-1">
                            {c.tipo} - {c.Nombre} ({c.Rareza}){' '}
                            {c.NombreEquipo && `- ${c.NombreEquipo}`}
                            {!(c.tipo === 'jugador' && c.Rareza?.toLowerCase() === 'comun') && (
                                <button
                                    className="ml-2 text-sm text-red-600"
                                    onClick={() => eliminarCarta(c)}
                                >
                                    Eliminar
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}