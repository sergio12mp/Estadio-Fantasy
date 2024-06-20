import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import { db } from "@/libs/mysql"; // Tu configuración de base de datos


export async function POST(req: NextRequest) {

    try {
        const jornadasMap = new Map<string, number>();
        const equiposMap = new Map<string, number>();
        const rows: any[] = [];
        const processCSV = new Promise<void>((resolve, reject) => {
            // Ajusta la ruta según tu configuración
            createReadStream('C:/Users/Sergio/Desktop/prV3/v3/data/partidosShort.csv')
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
            if (!temporadaResult?.idTemporada ) {
                await db.query('INSERT INTO Temporada (idTemporada, Nombre) VALUES (?, ?)', [1, 'Temporada 2022-2023']);
            }
        } catch (error) {
            if (error !== 'ER_DUP_ENTRY') {
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
            const jugadores = [
                {
                    nombre: row.Player,
                    edad: row.Age,
                    pais: row.Nation,
                    posicion: row.Pos,
                    precio: 0,
                    idEquipo: row.Team === row.Home_Team ? idEquipoLocal : idEquipoVisitante,
                },
            ];

            const estadisticas = [
                {
                    idPartido: 0, // Este valor debe ser asignado correctamente después de insertar el partido
                    idJornada: row.Matchweek, //Tengo que intentar reciclar el valor de antes
                    idEquipo: row.Team === row.Home_Team ? idEquipoLocal : idEquipoVisitante,
                    idJugador: null, // Este valor debe ser asignado correctamente después de insertar el jugador
                    min: row.Min,
                    gls: row.Gls,
                    ast: row.Ast,
                    pk: row.PK,
                    pkatt: row.PKatt,
                    sh: row.Sh,
                    sot: row.SoT,
                    crdy: row.CrdY,
                    crdr: row.CrdR,
                    touches: row.Touches,
                    tkl: row.Tkl,
                    int: row.Int,
                    blocks: row.Blocks,
                    xg_expected: row.xG_Expected,
                    npxg_expected: row.npxG_Expected,
                    xag_expected: row.xAG_Expected,
                    sca_sca: row.SCA_SCA,
                    gca_sca: row.GCA_SCA,
                    cmp_passes: row.Cmp_Passes,
                    att_passes: row.Att_Passes,
                    cmp_percent_passes: row.Cmp_percent_Passes,
                    prgp_passes: row.PrgP_Passes,
                    carries_carries: row.Carries_Carries,
                    prgc_carries: row.PrgC_Carries,
                    att_take_ons: row.Att_Take_Ons,
                    succ_take_ons: row.Succ_Take_Ons,
                },
            ];


            //EQUIPO
            console.log('Procesando Equipos:', equipos);
            for (const equipoNombre of equipos) {
                console.log(`Procesando equipo: ${equipoNombre}`);
                let idEquipo = equiposMap.get(equipoNombre);
                console.log('idEquipo:', idEquipo);
                if (!idEquipo) {
                    const query = 'SELECT idEquipo FROM Equipo WHERE Nombre = ?';

                    try {
                        const [existingEquipo]: any[] = await db.query(query, [equipoNombre]);
                        console.log('existingEquipo:', existingEquipo);

                        if (!existingEquipo) {
                            const [result]: any = await db.query('INSERT INTO Equipo (Nombre) VALUES (?)', [equipoNombre]);
                            idEquipo = result.insertId;
                            console.log(`Nuevo equipo insertado: ${equipoNombre}, idEquipo: ${idEquipo}`);
                        }
                        equiposMap.set(equipoNombre, idEquipo!);
                    } catch (error) {
                        if (error !== 'ER_DUP_ENTRY') {
                            console.error('Equipo Error handling equipo:', error);
                        } else {
                            console.log(`Equipo Duplicated entry for equipo: ${equipoNombre}`);
                        }
                        console.log('-----------------------------------------------');
                    }
                }
            }


            //JORNADA
            console.log(`Procesando: ${jornadaNombre}`);

            const query = 'SELECT idJornada FROM Jornada WHERE Nombre = ? AND idTemporada = ?';

            try {
                //La temporada por defecto es 1
                const [existingJornada]: any = await db.query(query, [jornadaNombre, 1]);

                console.log('Jornada Resultado de la consulta:', existingJornada ?? []);

                if (!existingJornada) {
                    const [result]: any = await db.query('INSERT INTO Jornada (Nombre, idTemporada) VALUES (?, ?)', [jornadaNombre, 1]);
                    idJornada = result?.insertId ?? [];
                    console.log(`Nueva jornada insertada: ${jornadaNombre}, idJornada: ${idJornada}`);
                }
                jornadasMap.set(jornadaNombre, idJornada!);
                console.log('-----------------------------------------------')
            } catch (error) {
                if (error !== 'ER_DUP_ENTRY') {
                    console.error('Jornada Error handling row:', error);
                } else {
                    console.log(`Jornada Duplicated entry for jornada: ${jornadaNombre}`);
                }
                console.log('-----------------------------------------------');
            }


            //PARTIDO
            console.log('Nombre Equipo Local:', nombreEquipoLocal);
            console.log('Nombre Equipo Visitante:', nombreEquipoVisitante);
            console.log('idJornadaPartido:', idJornada);

            //idEquipoLocal = equiposMap.get(nombreEquipoLocal);
            //idEquipoVisitante = equiposMap.get(nombreEquipoVisitante);
            try {
                const [resulstA]: any = await db.query('SELECT idEquipo FROM Equipo WHERE Nombre = ?', [nombreEquipoLocal]);
                const [resultB]: any = await db.query('SELECT idEquipo FROM Equipo WHERE Nombre = ?', [nombreEquipoVisitante]);
                const [resultJornada]: any = await db.query('SELECT idJornada FROM Jornada WHERE Nombre = ?', [jornadaNombre]);
                console.log('resulstA:', resulstA ?? []);
                console.log('resultB:', resultB ?? []);
                console.log('resultJornada:', resultJornada ?? []);

                idEquipoLocal = resulstA?.idEquipo ?? [];
                idEquipoVisitante = resultB?.idEquipo ?? [];
                idJornada = resultJornada?.idJornada ?? [];

                console.log('idEquipoLocal:', idEquipoLocal);
                console.log('idEquipoVisitante:', idEquipoVisitante);
                console.log('idJornada:', idJornada);
                console.log('logicaIf:', idJornada && idEquipoLocal && idEquipoVisitante);
                if (idJornada && idEquipoLocal && idEquipoVisitante) {
                    try {
                        console.log('logicaIf2:', idEquipoLocal != idEquipoVisitante);
                        const [existePartido]:any = await db.query('SELECT * FROM partido WHERE idJornada = ? AND idEquipoLocal = ? AND idEquipoVisitante = ?', [idJornada, idEquipoLocal, idEquipoVisitante]);
                        console.log('existePartido:', existePartido?.idPartido);
                        if (!existePartido?.idPartido) {
                            const query = 'INSERT INTO partido (idJornada, idEquipoLocal, idEquipoVisitante) VALUES (?, ?, ?)';
                            const [result]: any = await db.query(query, [idJornada, idEquipoLocal, idEquipoVisitante]);
                           // console.log(`Nuevo partido insertado: idJornada=${idJornada}, idEquipoLocal=${idEquipoLocal}, idEquipoVisitante=${idEquipoVisitante}`);
                        }

                    } catch (error) {
                        console.error('Partido Error insertando partido:', error);
                    }
                } else {
                    console.log(`Error: No se encontraron todos los IDs necesarios para insertar el partido: idJornada=${idJornada}, idEquipoLocal=${idEquipoLocal}, idEquipoVisitante=${idEquipoVisitante}`);
                }

            } catch (error) {
                console.error('Error executing queries:', error);
            }




            //JUGADOR
            for (const jugador of jugadores) {
                idEquipoJugador = row.Team === row.Home_Team ? idEquipoLocal : idEquipoVisitante;
                jugador.idEquipo = idEquipoJugador;
                
                
                console.log('Procesando Jugador:', jugador.nombre);
                
                try {
                    
                    const [existingJugador]: any[] = await db.query('SELECT idJugador FROM Jugador WHERE Nombre = ? AND idEquipo = ?', [jugador.nombre, jugador.idEquipo]);
                    console.log('existingJugador:', existingJugador?.idJugador ?? []);
                    if (!existingJugador?.idJugador?? []) {
                        const query = 'INSERT INTO Jugador (Nombre, Edad, Pais, Posicion, Precio, idEquipo) VALUES (?, ?, ?, ?, ?, ?)';
                        const [result]: any = await db.query(query, [jugador.nombre, jugador.edad, jugador.pais, jugador.posicion, jugador.precio, jugador.idEquipo]);
                       // console.log(`Nuevo jugador insertado: ${jugador.nombre}, idJugador: ${result.insertId}`);
                    }
                } catch (error) {
                    if (error !== 'ER_DUP_ENTRY') {
                        console.error('Jugador Error handling jugador:', jugador.nombre,error);
                    } else {
                        console.log(`Jugador Duplicated entry for jugador: ${jugador.nombre}`);
                    }
                }
            }



            //ESTADISTICA
            for (const estadistica of estadisticas) {
                console.log('   -----------------Procesando Estadisticas:');
                try {
                    
                    const [jugador]: any = await db.query('SELECT idJugador FROM Jugador WHERE Nombre = ? AND idEquipo = ?', [row.Player, idEquipoJugador]);
                    console.log('Jugador:', jugador);
                    estadistica.idEquipo = idEquipoJugador;
                    const [resultJornada]: any = await db.query('SELECT idJornada FROM Jornada WHERE Nombre = ?', [estadistica.idJornada]);
                    console.log('Jornada:', resultJornada);
                    estadistica.idJornada = resultJornada?.idJornada ?? [];
                    if (jugador) {
                        estadistica.idJugador = jugador?.idJugador;
                        console.log('idjugador:', estadistica.idJugador);
                        console.log('idJornada:', estadistica.idJornada, 'idEquipo:', estadistica.idEquipo, 'idJugador:', estadistica.idJugador);
                        const [partido]: any = await db.query('SELECT idPartido FROM partido WHERE idJornada = ? AND idEquipoLocal = ? AND idEquipoVisitante = ?', [estadistica.idJornada, idEquipoLocal, idEquipoVisitante]);
                        estadistica.idPartido = partido?.idPartido ?? [];
                        console.log('Partido:', partido);
                        const [queryEstadistica]: any = await db.query('SELECT * FROM Estadisticas WHERE idPartido = ? AND idJugador = ?', [estadistica.idPartido, estadistica.idJugador]);
                        if (!queryEstadistica) {//No meto estadisticas repetidas
                            if (estadistica.idPartido) {
                                const query = `INSERT INTO Estadisticas 
                                (idPartido, idJornada, idEquipo, idJugador, Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados, Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques, Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis, AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados, PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles, ConduccionesProgresivas, EntradasOfensivas, EntradasConExito) 
                                VALUES 
                                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                                const params = [
                                    estadistica.idPartido, estadistica.idJornada, estadistica.idEquipo, estadistica.idJugador, estadistica.min, estadistica.gls, estadistica.ast, estadistica.pk, estadistica.pkatt, estadistica.sh, estadistica.sot, estadistica.crdy, estadistica.crdr, estadistica.touches, estadistica.tkl, estadistica.int, estadistica.blocks, estadistica.xg_expected, estadistica.npxg_expected, estadistica.xag_expected, estadistica.sca_sca, estadistica.gca_sca, estadistica.cmp_passes, estadistica.att_passes, estadistica.cmp_percent_passes, estadistica.prgp_passes, estadistica.carries_carries, estadistica.prgc_carries, estadistica.att_take_ons, estadistica.succ_take_ons
                                ];

                                const [result]: any = await db.query(query, params);
                              //  console.log(`Nueva estadística insertada para idJugador=${estadistica.idJugador}, idPartido=${estadistica.idPartido}`);
                            } else {
                                console.error('No se encontró el partido para insertar las estadísticas.');
                            }
                        }
                    } else {
                        console.error('No se encontró el jugador para insertar las estadísticas.');
                    }
                } catch (error) {
                    console.error('--------Error insertando estadísticas:', error);
                }
            }



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
