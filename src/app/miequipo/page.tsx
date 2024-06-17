import { FooterHome } from "@/components/footer";

export default function Miequipo() {
    return (
<>
        <div className="containerMidBlue" >
            <h1>Selección de Jugadores y Alineaciones</h1>

            <h2><label htmlFor="alineaciones">Selecciona una alineación:</label></h2>
            <select id="alineaciones">
                <option value="4-3-3">4-3-3</option>
                <option value="3-4-3">3-4-3</option>
                <option value="4-4-2">4-4-2</option>
                <option value="5-3-2">5-3-2</option>
                {/*mas posibles alineaciones */}
            </select>


            

            <h2><label htmlFor="jugadores">Selecciona tu 11 inicial:</label></h2>

            {[...Array(11)].map((_, i) => (
                <div key={i}>
                    <label htmlFor={`jugadores${i + 1}`}>Selecciona el jugador {i + 1}:</label>
                    <select id={`jugadores${i + 1}`}>
                        {[...Array(10)].map((_, j) => (
                            <option key={j} value={`Jugador ${j + 1}`}>Jugador {j + 1}</option>
                        ))}
                    </select>
                </div>
            ))}
            {/* Sustituir 10 por la cantidad de jugadores totales*/}
            {/* Sustituir 10 por el tam de cartas jugador*/}


            <label htmlFor="buscador">Buscar por nombre:</label>
            <input type="text" id="buscador" placeholder="Ingresa el nombre del jugador" />

            <label htmlFor="filtroEquipo">Filtrar por equipo:</label>
            <select id="filtroEquipo">
                <option value="equipo1">Equipo 1</option>
                <option value="equipo2">Equipo 2</option>
                {/* Agrega más opciones aquí */}
            </select>

            {/* Botón de búsqueda (opcional) */}
           
            <button className="myButton" >Buscar</button>
        </div>
        <footer>
            <FooterHome></FooterHome>
        </footer>

        </>

    );
}