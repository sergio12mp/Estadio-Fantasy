 "use client";
 
 import React, { useState, useEffect } from 'react';
 import { FooterHome } from '@/components/footer';
 import PlayerSelection from '@/components/playerSelection';
 import { NavbarLite } from '@/components/navbarLite';
 
 const Page: React.FC = () => {
     const [alineacion, setAlineacion] = useState("1-4-3-3");
     const [equipos, setEquipos] = useState<any[]>([]);
     const [porteros, setPorteros] = useState<any[]>([]);
     const [defensas, setDefensas] = useState<any[]>([]);
     const [mediocampistas, setMediocampistas] = useState<any[]>([]);
     const [atacantes, setAtacantes] = useState<any[]>([]);
     const [loading, setLoading] = useState(true);
 
     // Fetch equipos desde la API
     useEffect(() => {
         const fetchEquipos = async () => {
             try {
                 const response = await fetch('/api/equipo');
                 const data = await response.json();
                 setEquipos(data);
                 setLoading(false);
             } catch (error) {
                 console.error('Error fetching equipos:', error);
                 setLoading(false);
             }
         };
         fetchEquipos();
     }, []);

     useEffect(() => {
            const fetchPorteros = async () => {
                try {
                    const response = await fetch('/api/jugadores');
                    const data = await response.json();
                    setPorteros(data);
                } catch (error) {
                    console.error('Error fetching porteros:', error);
                }
            };
            fetchPorteros();
        }, []);

        useEffect(() => {
            const fetchDefensas = async () => {
                try {
                    const response = await fetch('/api/jugadores');
                    const data = await response.json();
                    setDefensas(data);
                } catch (error) {
                    console.error('Error fetching defensas:', error);
                }
            };
            fetchDefensas();
        }, []);
         
        useEffect(() => {
            const fetchMediocampistas = async () => {
                try {
                    const response = await fetch('/api/jugadores');
                    const data = await response.json();
                    setMediocampistas(data);
                } catch (error) {
                    console.error('Error fetching centrocampistas:', error);
                }
            };
            fetchMediocampistas();
        }, []);

        useEffect(() => {
            const fetchAtacantes = async () => {
                try {
                    const response = await fetch('/api/jugadores');
                    const data = await response.json();
                    setAtacantes(data);
                } catch (error) {
                    console.error('Error fetching atacantes:', error);
                }
            };
            fetchAtacantes();
        }, []);
 
     const handleAlineacionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
         setAlineacion(event.target.value);
     };
 
     const renderPlayerSelection = () => {
         const alineaciones: { [key: string]: { numJugadores: number, rol: string, inline?: boolean }[] } = {
             "1-4-3-3": [
                 { numJugadores: 1, rol: "Portero" },
                 { numJugadores: 4, rol: "Defensa" },
                 { numJugadores: 3, rol: "Medio" },
                 { numJugadores: 3, rol: "Atacante" }
             ],
             "1-3-4-3": [
                 { numJugadores: 1, rol: "Portero" },
                 { numJugadores: 3, rol: "Defensa" },
                 { numJugadores: 4, rol: "Medio" },
                 { numJugadores: 3, rol: "Atacante" }
             ],
             "1-4-4-2": [
                 { numJugadores: 1, rol: "Portero" },
                 { numJugadores: 4, rol: "Defensa" },
                 { numJugadores: 4, rol: "Medio" },
                 { numJugadores: 2, rol: "Atacante" }
             ],
             "1-3-3-4": [
                 { numJugadores: 1, rol: "Portero" },
                 { numJugadores: 3, rol: "Defensa" },
                 { numJugadores: 3, rol: "Medio" },
                 { numJugadores: 4, rol: "Atacante" }
             ]
         };
 
         const filas = alineaciones[alineacion];
         let playerIndex = 1;
         return filas.map((fila, filaIndex) => (
             <div
                 className="row"
                 key={filaIndex}
                 style={{
                     display: 'flex',
                     justifyContent: fila.inline ? 'space-around' : 'center',
                     flexDirection: fila.inline ? 'row' : 'row',
                     marginBottom: '20px'
                 }}
             >
                 {[...Array(fila.numJugadores)].map((_, i) => (
                     <PlayerSelection
                         key={playerIndex}
                         idJugador={playerIndex}
                         Nombre={`Jugador ${playerIndex}`}
                         idEquipo={playerIndex}
                         Posicion={fila.rol}
                         Precio={playerIndex * 10}
                         Edad={''}
                         Pais={''}
                     />
                 ))}
                 {playerIndex++}
             </div>
         ));
     };
 
     return (
         <>
             <div className="containerMidBlue">
                 <h1>Selección de Jugadores y Alineaciones</h1>
                 <h2><label htmlFor="alineaciones">Selecciona una alineación:</label></h2>
                 <select id="alineaciones" onChange={handleAlineacionChange} value={alineacion}>
                     <option value="1-4-3-3">4-3-3</option>
                     <option value="1-3-4-3">3-4-3</option>
                     <option value="1-4-4-2">4-4-2</option>
                     <option value="1-3-3-4">3-3-4</option>
                 </select>
                 <h2><label htmlFor="jugadores">Selecciona tu 11 inicial:</label></h2>
                 <label htmlFor="buscador">Buscar por nombre:</label>
                 <input type="text" id="buscador" placeholder="Ingresa el nombre del jugador" />
                 <label htmlFor="filtroEquipo">Filtrar por equipo:</label>
                 {loading ? (
                     <p>Cargando equipos...</p>
                 ) : (
                     <select id="filtroEquipo">
                         <option value="">Todos los equipos</option>
                        
                     </select>
                 )}
                 <button className="myButton">Buscar</button>
             </div>
             {renderPlayerSelection()}
             <footer>
                 <FooterHome />
             </footer>
         </>
     );
 };
 
 export default Page;
 