import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import { db } from "@/lib/mysql"; // Tu configuración de base de datos


export async function POST(req: NextRequest) {

    try {
        const jornadasMap = new Map<string, number>();
        const equiposMap = new Map<string, number>();
        const rows: any[] = [];
        const processCSV = new Promise<void>((resolve, reject) => {
            // Ajusta la ruta según tu configuración
            // RUTA CORREGIDA AQUÍ:
            createReadStream('C:/Users/Sergio/Desktop/prV3/v3/data/partidos2223AdvanceSummary.csv')
                .pipe(csv())
                .on('data', (row) => {
                    rows.push(row);
                })
                .on('end', () => {
                    console.log('CSV file successfully processed');
                    resolve();
                })
                .on('error', (error: unknown) => {
                    console.error('Error processing CSV file:', error as Error);
                    reject(error as Error);
                });
        });
        await processCSV;


        //TEMPORADA

        try {
            //Por defecto creamos una temporada con id 1
            const [temporadaResult]: any = await db.query('SELECT idTemporada FROM Temporada WHERE idTemporada = 1');
            console.log('temporadaResult:', temporadaResult);
            // La consulta db.query devuelve un array de arrays o un array de objetos
            // Si la consulta no devuelve filas, temporadaResult[0] será undefined.
            // Si devuelve filas, temporadaResult[0] será el primer objeto de la fila.
            // Por lo tanto, para verificar si existe, es mejor verificar la longitud del array o el primer elemento.
            if (!temporadaResult || temporadaResult.length === 0 || !temporadaResult[0]?.idTemporada) {
                await db.query('INSERT INTO Temporada (idTemporada, Nombre) VALUES (?, ?)', [1, 'Temporada 2022-2023']);
            }
        } catch (error: any) { // Explicitly type error for better handling
            // MySQL error code for duplicate entry is usually 'ER_DUP_ENTRY' or errno 1062
            // Check if the error is an object with a 'code' property
            if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                console.log('Temporada Duplicated entry for temporada 1, skipping insertion.');
            } else {
                console.error('Temporada Error creating default season:', error);
                throw error; // Rethrow unexpected errors
            }
        }


        for (const row of rows) {
            const equipos = [row.Home_Team, row.Away_Team];
            const jornadaNombre = row.Matchweek;
            const nombreEquipoLocal = row.Home_Team;
            const nombreEquipoVisitante = row.Away_Team;
            let idEquipoLocal: number = 0;
            let idEquipoVisitante: number = 0;
            let idJornada = 0;
            let idEquipoJugador = 0;

            // Asegúrate de que idEquipo sea asignado *después* de que los equipos se hayan insertado
            // Esto se hará en el bucle de equipos y luego se recuperará.

            const jugadores = [
                {
                    nombre: row.Player,
                    edad: row.Age,
                    pais: row.Nation,
                    posicion: row.Pos,
                    precio: 0,
                    // idEquipo se asignará después de obtener idEquipoLocal/idEquipoVisitante
                    idEquipo: 0, // Valor inicial, se actualizará más adelante
                },
            ];

            const estadisticas = [
                {
                    idPartido: 0, // Este valor debe ser asignado correctamente después de insertar el partido
                    idJornada: row.Matchweek, // Este es el nombre de la jornada del CSV
                    idEquipo: 0, // Valor inicial, se actualizará
                    idJugador: null, // Este valor debe ser asignado correctamente después de insertar el jugador
                    min: parseFloat(row.Min) || 0, // Convertir a número
                    gls: parseInt(row.Gls) || 0,
                    ast: parseInt(row.Ast) || 0,
                    pk: parseInt(row.PK) || 0,
                    pkatt: parseInt(row.PKatt) || 0,
                    sh: parseInt(row.Sh) || 0,
                    sot: parseInt(row.SoT) || 0,
                    crdy: parseInt(row.CrdY) || 0,
                    crdr: parseInt(row.CrdR) || 0,
                    touches: parseInt(row.Touches) || 0,
                    tkl: parseInt(row.Tkl) || 0,
                    int: parseInt(row.Int) || 0,
                    blocks: parseInt(row.Blocks) || 0,
                    xg_expected: parseFloat(row.xG_Expected) || 0,
                    npxg_expected: parseFloat(row.npxG_Expected) || 0,
                    xag_expected: parseFloat(row.xAG_Expected) || 0,
                    sca_sca: parseInt(row.SCA_SCA) || 0,
                    gca_sca: parseInt(row.GCA_SCA) || 0,
                    cmp_passes: parseInt(row.Cmp_Passes) || 0,
                    att_passes: parseInt(row.Att_Passes) || 0,
                    cmp_percent_passes: parseFloat(row.Cmp_percent_Passes) || 0,
                    prgp_passes: parseInt(row.PrgP_Passes) || 0,
                    carries_carries: parseInt(row.Carries_Carries) || 0,
                    prgc_carries: parseInt(row.PrgC_Carries) || 0,
                    att_take_ons: parseInt(row.Att_Take_Ons) || 0,
                    succ_take_ons: parseInt(row.Succ_Take_Ons) || 0,
                },
            ];


            // --- Lógica de inserción de EQUIPOS ---
            console.log('Procesando Equipos:', equipos);
            for (const equipoNombre of equipos) {
                let idEquipo = equiposMap.get(equipoNombre);
                console.log(`Equipo ${equipoNombre} en mapa: ${idEquipo}`);
                
                if (!idEquipo) {
                    try {
                        const [existingEquipoRows]: any[] = await db.query('SELECT idEquipo FROM Equipo WHERE Nombre = ?', [equipoNombre]);
                        
                        if (existingEquipoRows && existingEquipoRows.length > 0) {
                            idEquipo = existingEquipoRows[0].idEquipo;
                            console.log(`Equipo existente encontrado: ${equipoNombre}, idEquipo: ${idEquipo}`);
                        } else {
                            const [result]: any = await db.query('INSERT INTO Equipo (Nombre) VALUES (?)', [equipoNombre]);
                            idEquipo = result.insertId;
                            console.log(`Nuevo equipo insertado: ${equipoNombre}, idEquipo: ${idEquipo}`);
                        }
                        equiposMap.set(equipoNombre, idEquipo!);
                    } catch (error: any) {
                        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                            console.log(`Equipo Duplicated entry for equipo: ${equipoNombre}. Fetching existing ID.`);
                            const [existingEquipoRows]: any[] = await db.query('SELECT idEquipo FROM Equipo WHERE Nombre = ?', [equipoNombre]);
                            if (existingEquipoRows && existingEquipoRows.length > 0) {
                                idEquipo = existingEquipoRows[0].idEquipo;
                                equiposMap.set(equipoNombre, idEquipo!);
                            } else {
                                console.error(`Equipo Fatal error: Could not get ID for duplicated equipo ${equipoNombre}`);
                                throw error; // Rethrow if we can't even get the ID after a dup entry
                            }
                        } else {
                            console.error('Equipo Error handling equipo:', error);
                            throw error; // Rethrow unexpected errors
                        }
                    }
                }
            }

            // Actualizar idEquipoLocal e idEquipoVisitante DESPUÉS de asegurar que los equipos están en el mapa
            idEquipoLocal = equiposMap.get(nombreEquipoLocal)!;
            idEquipoVisitante = equiposMap.get(nombreEquipoVisitante)!;

            // --- Lógica de inserción de JORNADA ---
            console.log(`Procesando Jornada: ${jornadaNombre}`);
            const queryJornada = 'SELECT idJornada FROM Jornada WHERE Nombre = ? AND idTemporada = ?';
            try {
                const [existingJornadaRows]: any = await db.query(queryJornada, [jornadaNombre, 1]); // idTemporada por defecto es 1

                if (existingJornadaRows && existingJornadaRows.length > 0) {
                    idJornada = existingJornadaRows[0].idJornada;
                    console.log(`Jornada existente encontrada: ${jornadaNombre}, idJornada: ${idJornada}`);
                } else {
                    const [result]: any = await db.query('INSERT INTO Jornada (Nombre, idTemporada) VALUES (?, ?)', [jornadaNombre, 1]);
                    idJornada = result.insertId;
                    console.log(`Nueva jornada insertada: ${jornadaNombre}, idJornada: ${idJornada}`);
                }
                jornadasMap.set(jornadaNombre, idJornada);
                console.log('-----------------------------------------------');
            } catch (error: any) {
                if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                    console.log(`Jornada Duplicated entry for jornada: ${jornadaNombre}. Fetching existing ID.`);
                    const [existingJornadaRows]: any = await db.query(queryJornada, [jornadaNombre, 1]);
                    if (existingJornadaRows && existingJornadaRows.length > 0) {
                        idJornada = existingJornadaRows[0].idJornada;
                        jornadasMap.set(jornadaNombre, idJornada);
                    } else {
                        console.error(`Jornada Fatal error: Could not get ID for duplicated jornada ${jornadaNombre}`);
                        throw error;
                    }
                } else {
                    console.error('Jornada Error handling row:', error);
                    throw error;
                }
                console.log('-----------------------------------------------');
            }


            // --- Lógica de inserción de PARTIDO ---
            console.log('Nombre Equipo Local:', nombreEquipoLocal);
            console.log('Nombre Equipo Visitante:', nombreEquipoVisitante);
            console.log('idJornadaPartido:', idJornada);

            try {
                // Verificar que los IDs se obtuvieron correctamente
                if (idJornada && idEquipoLocal && idEquipoVisitante) {
                    console.log(`Verificando partido: Jornada=${idJornada}, Local=${idEquipoLocal}, Visitante=${idEquipoVisitante}`);
                    // Asegurarse de buscar si el partido ya existe para evitar duplicados
                    const [existePartidoRows]: any = await db.query(
                        'SELECT idPartido FROM Partido WHERE idJornada = ? AND idEquipoLocal = ? AND idEquipoVisitante = ?',
                        [idJornada, idEquipoLocal, idEquipoVisitante]
                    );
                    
                    let idPartido: number;
                    if (existePartidoRows && existePartidoRows.length > 0) {
                        idPartido = existePartidoRows[0].idPartido;
                        console.log(`Partido existente encontrado: idPartido=${idPartido}`);
                    } else {
                        console.log(`Insertando nuevo partido: idJornada=${idJornada}, idEquipoLocal=${idEquipoLocal}, idEquipoVisitante=${idEquipoVisitante}`);
                        const queryPartido = 'INSERT INTO Partido (idJornada, idEquipoLocal, idEquipoVisitante) VALUES (?, ?, ?)';
                        const [result]: any = await db.query(queryPartido, [idJornada, idEquipoLocal, idEquipoVisitante]);
                        idPartido = result.insertId;
                        console.log(`Nuevo partido insertado con id: ${idPartido}`);
                    }
                    // Asignar el idPartido a la estadística
                    estadisticas[0].idPartido = idPartido;


                } else {
                    console.error(`Error: No se encontraron todos los IDs necesarios para insertar/obtener el partido: idJornada=${idJornada}, idEquipoLocal=${idEquipoLocal}, idEquipoVisitante=${idEquipoVisitante}`);
                }

            } catch (error) {
                console.error('Error procesando partido:', error);
            }

            // --- Lógica de inserción de JUGADOR ---
            for (const jugador of jugadores) {
                // Asigna el idEquipo correcto al jugador ANTES de la consulta
                jugador.idEquipo = row.Team === row.Home_Team ? idEquipoLocal : idEquipoVisitante;
                
                console.log('Procesando Jugador:', jugador.nombre, 'Equipo:', jugador.idEquipo);
                
                try {
                    const [existingJugadorRows]: any[] = await db.query('SELECT idJugador FROM Jugador WHERE Nombre = ? AND idEquipo = ?', [jugador.nombre, jugador.idEquipo]);
                    
                    if (existingJugadorRows && existingJugadorRows.length > 0) {
                        // Jugador ya existe
                        //console.log(`Jugador existente: ${jugador.nombre}, idJugador: ${existingJugadorRows[0].idJugador}`);
                    } else {
                        const queryJugador = 'INSERT INTO Jugador (Nombre, Edad, Pais, Posicion, Precio, idEquipo) VALUES (?, ?, ?, ?, ?, ?)';
                        const [result]: any = await db.query(queryJugador, [jugador.nombre, jugador.edad, jugador.pais, jugador.posicion, jugador.precio, jugador.idEquipo]);
                        //console.log(`Nuevo jugador insertado: ${jugador.nombre}, idJugador: ${result.insertId}`);
                    }
                } catch (error: any) {
                    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                        console.log(`Jugador Duplicated entry for jugador: ${jugador.nombre}, equipo ${jugador.idEquipo}`);
                    } else {
                        console.error('Jugador Error handling jugador:', jugador.nombre, error);
                        throw error;
                    }
                }
            }


         // ... (código anterior) ...

            // --- Lógica de inserción de ESTADISTICAS ---
            for (const estadistica of estadisticas) {
                console.log('----------------- Procesando Estadisticas -----------------');
                console.log(`Fila CSV actual (para depuración):`, row); 

                // *** AJUSTE CLAVE AQUÍ ***
                // Aseguramos que estadistica.idEquipo tenga el ID correcto del equipo al que pertenece el jugador de esta fila
                estadistica.idEquipo = row.Team === row.Home_Team ? idEquipoLocal : idEquipoVisitante;
                console.log(`DEBUG Estadísticas: ID Equipo asignado a estadística (calculado): ${estadistica.idEquipo} para jugador ${row.Player}. Home_Team: ${row.Home_Team}, Away_Team: ${row.Away_Team}, Team (CSV): ${row.Team}`);


                try {
                    // Paso 1: Obtener idJugador
                    // Usamos el estadistica.idEquipo que acabamos de asegurar
                    const [jugadorDBRows]: any = await db.query('SELECT idJugador FROM Jugador WHERE Nombre = ? AND idEquipo = ?', [row.Player, estadistica.idEquipo]);
                    
                    if (jugadorDBRows && jugadorDBRows.length > 0) {
                        estadistica.idJugador = jugadorDBRows[0].idJugador;
                        console.log(`DEBUG Estadísticas: Jugador '${row.Player}' ID encontrado: ${estadistica.idJugador} con Equipo ${estadistica.idEquipo}`);
                    } else {
                        console.error(`ERROR Estadísticas: No se encontró el ID del jugador '${row.Player}' para el equipo ${estadistica.idEquipo}. Saltando estadística.`);
                        // Aquí es donde el error original decía "equipo 0". Con el ajuste, debería ser el ID real.
                        console.log(`DEBUG Estadísticas: Equipo asignado para jugador (verificación): ${estadistica.idEquipo}, Nombre equipo local: ${nombreEquipoLocal}, Nombre equipo visitante: ${nombreEquipoVisitante}, Team en CSV: ${row.Team}`);
                        continue; // Saltar esta estadística si no se encuentra el jugador
                    }

                    // Paso 2: Obtener idJornada (del nombre de la jornada en el CSV)
                    // Este paso ya debería tener el ID correcto de la jornada 'idJornada' que se obtiene en la sección de Jornada.
                    // Pero para robustez, lo confirmamos.
                    const [jornadaDBRows]: any = await db.query('SELECT idJornada FROM Jornada WHERE Nombre = ? AND idTemporada = ?', [jornadaNombre, 1]); // Usar 'jornadaNombre' del row actual
                    if (jornadaDBRows && jornadaDBRows.length > 0) {
                        estadistica.idJornada = jornadaDBRows[0].idJornada;
                        console.log(`DEBUG Estadísticas: Jornada '${jornadaNombre}' ID encontrado: ${estadistica.idJornada}`);
                    } else {
                        console.error(`ERROR Estadísticas: No se encontró el ID de la jornada '${jornadaNombre}'. Saltando estadística.`);
                        continue;
                    }
                    
                    // Paso 3: Obtener idPartido
                    const [partidoDBRows]: any = await db.query('SELECT idPartido FROM Partido WHERE idJornada = ? AND idEquipoLocal = ? AND idEquipoVisitante = ?', [estadistica.idJornada, idEquipoLocal, idEquipoVisitante]);
                    if (partidoDBRows && partidoDBRows.length > 0) {
                        estadistica.idPartido = partidoDBRows[0].idPartido;
                        console.log(`DEBUG Estadísticas: Partido ID encontrado: ${estadistica.idPartido} (J:${estadistica.idJornada}, EL:${idEquipoLocal}, EV:${idEquipoVisitante})`);
                    } else {
                        console.error(`ERROR Estadísticas: No se encontró el ID del partido para Jornada=${estadistica.idJornada}, Local=${idEquipoLocal}, Visitante=${idEquipoVisitante}. Saltando estadística.`);
                        continue;
                    }
                    

                    // Paso 4: Verificar si la estadística ya existe
                    console.log(`DEBUG Estadísticas: Verificando duplicidad para Partido=${estadistica.idPartido}, Jugador=${estadistica.idJugador}`);
                    const [existingEstadisticaRows]: any = await db.query(
                        'SELECT idEstadisticas FROM Estadisticas WHERE idPartido = ? AND idJugador = ?',
                        [estadistica.idPartido, estadistica.idJugador]
                    );

                    if (!existingEstadisticaRows || existingEstadisticaRows.length === 0) { // Si no existen estadísticas repetidas
                        console.log(`DEBUG Estadísticas: Estadística NO existente. Preparando inserción.`);
                        // Paso 5: Validar que todos los IDs necesarios están presentes
                        if (estadistica.idPartido && estadistica.idJugador && estadistica.idJornada && estadistica.idEquipo) {
                            console.log(`DEBUG Estadísticas: Todos los IDs necesarios están presentes. Preparando query de inserción.`);

                            const insertQuery = `INSERT INTO Estadisticas 
                            (idPartido, idJornada, idEquipo, idJugador, Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados, Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques, Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis, AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados, PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles, ConduccionesProgresivas, EntradasOfensivas, EntradasConExito) 
                            VALUES 
                            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                            
                            const params = [
                                estadistica.idPartido, estadistica.idJornada, estadistica.idEquipo, estadistica.idJugador,
                                estadistica.min, estadistica.gls, estadistica.ast, estadistica.pk, estadistica.pkatt,
                                estadistica.sh, estadistica.sot, estadistica.crdy, estadistica.crdr, estadistica.touches,
                                estadistica.tkl, estadistica.int, estadistica.blocks, estadistica.xg_expected,
                                estadistica.npxg_expected, estadistica.xag_expected, estadistica.sca_sca, estadistica.gca_sca,
                                estadistica.cmp_passes, estadistica.att_passes, estadistica.cmp_percent_passes,
                                estadistica.prgp_passes, estadistica.carries_carries, estadistica.prgc_carries,
                                estadistica.att_take_ons, estadistica.succ_take_ons
                            ];
                            
                            console.log('DEBUG Estadísticas: Parámetros para la inserción:', params);

                            const [result]: any = await db.query(insertQuery, params);
                            console.log(`INFO Estadísticas: Nueva estadística insertada para idJugador=${estadistica.idJugador}, idPartido=${estadistica.idPartido}. InsertId: ${result.insertId}`);
                        } else {
                            console.error('ERROR Estadísticas: IDs necesarios para insertar estadísticas no encontrados. Saltando.');
                            console.log(`DEBUG IDs Faltantes: Partido=${estadistica.idPartido}, Jugador=${estadistica.idJugador}, Jornada=${estadistica.idJornada}, Equipo=${estadistica.idEquipo}`);
                        }
                    } else {
                        console.log(`INFO Estadísticas: Estadística ya existe para idJugador=${estadistica.idJugador}, idPartido=${estadistica.idPartido}. Saltando inserción.`);
                    }
                } catch (error: any) {
                    console.error('CRITICAL ERROR Estadísticas: Error insertando estadísticas:', error);
                    if (error.code) console.error('SQL Error Code:', error.code);
                    if (error.sqlMessage) console.error('SQL Error Message:', error.sqlMessage);
                }
            }
// ... (resto del código) ...
        }
        db.end();

        return NextResponse.json({ message: 'CSV file processing completed' });
    } catch (error) {
        console.error('General Error handling request:', error);
        return NextResponse.json({ message: 'General Error handling request', error }, { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};