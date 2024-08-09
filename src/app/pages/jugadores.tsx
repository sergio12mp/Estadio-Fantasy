"use client";
import React, { useState, useEffect } from 'react';
import { Jugador } from '@/libs/data';
import { FooterHome } from '@/components/footer';

const Jugadores: React.FC = () => {
    const [query, setQuery] = useState('');
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [filteredJugadores, setFilteredJugadores] = useState<Jugador[]>([]);

    useEffect(() => {
        const fetchJugadores = async () => {
            try {
                const response = await fetch('/api/jugador');
                const data = await response.json();
                setJugadores(data);
            } catch (error) {
                console.error('Error fetching players:', error);
            }
        };

        fetchJugadores();
    }, []);

    useEffect(() => {
        setFilteredJugadores(
            jugadores.filter((jugador) =>
                jugador.Nombre.toLowerCase().includes(query.toLowerCase())
            )
        );
    }, [query, jugadores]);

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar jugadores..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ padding: '10px', marginBottom: '20px', width: '100%' }}
            />
            <div>
                {filteredJugadores.length > 0 ? (
                    filteredJugadores.map((jugador) => (
                        <div key={jugador.idJugador} style={{ padding: '10px', border: '1px solid #ddd', marginBottom: '10px' }}>
                            <h3>{jugador.Nombre}</h3>
                            <p>Edad: {jugador.Edad}</p>
                            <p>País: {jugador.Pais}</p>
                            <p>Posición: {jugador.Posicion}</p>
                            <p>Precio: {jugador.Precio}</p>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron jugadores</p>
                )}
            </div>
            <footer>
                <FooterHome />
            </footer>
        </div>

    );
};

export default Jugadores;
