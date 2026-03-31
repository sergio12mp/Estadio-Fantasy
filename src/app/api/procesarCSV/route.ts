import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { db } from "@/lib/mysql";

async function parseCSVFromBuffer(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const rows: any[] = [];
        const stream = Readable.from(buffer);
        stream
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', reject);
    });
}

// Columnas del CSV de porteros (worldfootballR fb_advanced_match_stats stat_type="keeper")
// Ajusta los nombres si tu versión de worldfootballR usa nombres distintos.
// Columnas esperadas: Player, Team, Home_Team, Away_Team, Matchweek,
//   GA (Goles Encajados), Saves (Paradas), CS (Portería a Cero 0/1),
//   PSxG (Post-Shot xG), PKsv (Penaltis Parados)
async function procesarPorteros(
    rows: any[],
    equiposMap: Map<string, number>,
    jornadasMap: Map<string, number>
): Promise<number> {
    let actualizados = 0;
    for (const row of rows) {
        try {
            const jornadaNombre = row.Matchweek ?? row.Round ?? row.RoundNumber;
            const equipoNombre  = row.Team;
            const playerNombre  = row.Player;
            if (!jornadaNombre || !equipoNombre || !playerNombre) continue;

            // Resolver idEquipo (ya debería estar en el mapa tras procesar el summary)
            let idEquipo = equiposMap.get(equipoNombre);
            if (!idEquipo) {
                const [rows2]: any = await db.query('SELECT idEquipo FROM Equipo WHERE Nombre = ?', [equipoNombre]);
                if (!rows2?.length) continue;
                idEquipo = rows2[0].idEquipo;
                equiposMap.set(equipoNombre, idEquipo!);
            }

            // Resolver idJornada
            let idJornada = jornadasMap.get(jornadaNombre);
            if (!idJornada) {
                const [rows3]: any = await db.query(
                    'SELECT idJornada FROM Jornada WHERE Nombre = ? AND idTemporada = 1', [jornadaNombre]
                );
                if (!rows3?.length) continue;
                idJornada = rows3[0].idJornada;
                jornadasMap.set(jornadaNombre, idJornada!);
            }

            // Resolver idJugador
            const [jugRows]: any = await db.query(
                'SELECT idJugador FROM Jugador WHERE Nombre = ? AND idEquipo = ?',
                [playerNombre, idEquipo]
            );
            if (!jugRows?.length) continue;
            const idJugador = jugRows[0].idJugador;

            // Mapear columnas del CSV keeper → columnas DB
            // worldfootballR puede nombrarlas como GA, Saves, CS, PSxG, PKsv
            // o con sufijos como GA_Keeper, Saves_Keeper, etc. Ajusta aquí si hace falta.
            const paradas         = parseInt(row.Saves ?? row.Saves_Keeper ?? '0') || 0;
            const golesEncajados  = parseInt(row.GA   ?? row.GA_Keeper    ?? '0') || 0;
            const porteriaACero   = parseInt(row.CS   ?? '0') || 0;
            const psxgPortero     = parseFloat(row.PSxG ?? row.PSxG_Keeper ?? '0') || 0;
            const penaltisParados = parseInt(row.PKsv ?? row.PKsv_Keeper  ?? '0') || 0;

            await db.query(
                `UPDATE Estadisticas
                 SET Paradas = ?, GolesEncajados = ?, PorteriaACero = ?,
                     PSxGPortero = ?, PenaltisParados = ?
                 WHERE idJugador = ? AND idJornada = ?`,
                [paradas, golesEncajados, porteriaACero, psxgPortero, penaltisParados, idJugador, idJornada]
            );
            actualizados++;
        } catch (err: any) {
            console.error('Error procesando fila portero:', err.message);
        }
    }
    return actualizados;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const filePorteros = formData.get('filePorteros') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Se requiere un archivo CSV (campo "file")' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const rows = await parseCSVFromBuffer(buffer);

        const jornadasMap = new Map<string, number>();
        const equiposMap = new Map<string, number>();

        //TEMPORADA
        try {
            const [temporadaResult]: any = await db.query('SELECT idTemporada FROM Temporada WHERE idTemporada = 1');
            if (!temporadaResult || temporadaResult.length === 0 || !temporadaResult[0]?.idTemporada) {
                await db.query('INSERT INTO Temporada (idTemporada, Nombre) VALUES (?, ?)', [1, 'Temporada 2022-2023']);
            }
        } catch (error: any) {
            if (error.code !== 'ER_DUP_ENTRY' && error.errno !== 1062) {
                console.error('Error creando temporada:', error);
                throw error;
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

            const jugadores = [
                {
                    nombre: row.Player,
                    edad: row.Age,
                    pais: row.Nation,
                    posicion: row.Pos,
                    precio: 0,
                    idEquipo: 0,
                },
            ];

            const estadisticas = [
                {
                    idPartido: 0,
                    idJornada: row.Matchweek,
                    idEquipo: 0,
                    idJugador: null as number | null,
                    min: parseFloat(row.Min) || 0,
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

            // --- EQUIPOS ---
            for (const equipoNombre of equipos) {
                let idEquipo = equiposMap.get(equipoNombre);
                if (!idEquipo) {
                    try {
                        const [existingEquipoRows]: any[] = await db.query('SELECT idEquipo FROM Equipo WHERE Nombre = ?', [equipoNombre]);
                        if (existingEquipoRows && existingEquipoRows.length > 0) {
                            idEquipo = existingEquipoRows[0].idEquipo;
                        } else {
                            const [result]: any = await db.query('INSERT INTO Equipo (Nombre) VALUES (?)', [equipoNombre]);
                            idEquipo = result.insertId;
                        }
                        equiposMap.set(equipoNombre, idEquipo!);
                    } catch (error: any) {
                        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                            const [existingEquipoRows]: any[] = await db.query('SELECT idEquipo FROM Equipo WHERE Nombre = ?', [equipoNombre]);
                            if (existingEquipoRows?.length > 0) {
                                idEquipo = existingEquipoRows[0].idEquipo;
                                equiposMap.set(equipoNombre, idEquipo!);
                            } else throw error;
                        } else throw error;
                    }
                }
            }

            idEquipoLocal = equiposMap.get(nombreEquipoLocal)!;
            idEquipoVisitante = equiposMap.get(nombreEquipoVisitante)!;

            // --- JORNADA ---
            const queryJornada = 'SELECT idJornada FROM Jornada WHERE Nombre = ? AND idTemporada = ?';
            try {
                const [existingJornadaRows]: any = await db.query(queryJornada, [jornadaNombre, 1]);
                if (existingJornadaRows?.length > 0) {
                    idJornada = existingJornadaRows[0].idJornada;
                } else {
                    const [result]: any = await db.query('INSERT INTO Jornada (Nombre, idTemporada) VALUES (?, ?)', [jornadaNombre, 1]);
                    idJornada = result.insertId;
                }
                jornadasMap.set(jornadaNombre, idJornada);
            } catch (error: any) {
                if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
                    const [existingJornadaRows]: any = await db.query(queryJornada, [jornadaNombre, 1]);
                    if (existingJornadaRows?.length > 0) {
                        idJornada = existingJornadaRows[0].idJornada;
                        jornadasMap.set(jornadaNombre, idJornada);
                    } else throw error;
                } else throw error;
            }

            // --- PARTIDO ---
            try {
                if (idJornada && idEquipoLocal && idEquipoVisitante) {
                    const [existePartidoRows]: any = await db.query(
                        'SELECT idPartido FROM Partido WHERE idJornada = ? AND idEquipoLocal = ? AND idEquipoVisitante = ?',
                        [idJornada, idEquipoLocal, idEquipoVisitante]
                    );
                    let idPartido: number;
                    if (existePartidoRows?.length > 0) {
                        idPartido = existePartidoRows[0].idPartido;
                    } else {
                        const [result]: any = await db.query(
                            'INSERT INTO Partido (idJornada, idEquipoLocal, idEquipoVisitante) VALUES (?, ?, ?)',
                            [idJornada, idEquipoLocal, idEquipoVisitante]
                        );
                        idPartido = result.insertId;
                    }
                    estadisticas[0].idPartido = idPartido;
                }
            } catch (error) {
                console.error('Error procesando partido:', error);
            }

            // --- JUGADOR ---
            for (const jugador of jugadores) {
                jugador.idEquipo = row.Team === row.Home_Team ? idEquipoLocal : idEquipoVisitante;
                try {
                    const [existingJugadorRows]: any[] = await db.query(
                        'SELECT idJugador FROM Jugador WHERE Nombre = ? AND idEquipo = ?',
                        [jugador.nombre, jugador.idEquipo]
                    );
                    if (!existingJugadorRows || existingJugadorRows.length === 0) {
                        await db.query(
                            'INSERT INTO Jugador (Nombre, Edad, Pais, Posicion, Precio, idEquipo) VALUES (?, ?, ?, ?, ?, ?)',
                            [jugador.nombre, jugador.edad, jugador.pais, jugador.posicion, jugador.precio, jugador.idEquipo]
                        );
                    }
                } catch (error: any) {
                    if (error.code !== 'ER_DUP_ENTRY' && error.errno !== 1062) {
                        console.error('Error insertando jugador:', jugador.nombre, error);
                        throw error;
                    }
                }
            }

            // --- ESTADISTICAS ---
            for (const estadistica of estadisticas) {
                estadistica.idEquipo = row.Team === row.Home_Team ? idEquipoLocal : idEquipoVisitante;

                try {
                    const [jugadorDBRows]: any = await db.query(
                        'SELECT idJugador FROM Jugador WHERE Nombre = ? AND idEquipo = ?',
                        [row.Player, estadistica.idEquipo]
                    );
                    if (!jugadorDBRows?.length) { continue; }
                    estadistica.idJugador = jugadorDBRows[0].idJugador;

                    const [jornadaDBRows]: any = await db.query(
                        'SELECT idJornada FROM Jornada WHERE Nombre = ? AND idTemporada = ?',
                        [jornadaNombre, 1]
                    );
                    if (!jornadaDBRows?.length) { continue; }
                    estadistica.idJornada = jornadaDBRows[0].idJornada;

                    const [partidoDBRows]: any = await db.query(
                        'SELECT idPartido FROM Partido WHERE idJornada = ? AND idEquipoLocal = ? AND idEquipoVisitante = ?',
                        [estadistica.idJornada, idEquipoLocal, idEquipoVisitante]
                    );
                    if (!partidoDBRows?.length) { continue; }
                    estadistica.idPartido = partidoDBRows[0].idPartido;

                    const [existingEstadisticaRows]: any = await db.query(
                        'SELECT idEstadisticas FROM Estadisticas WHERE idPartido = ? AND idJugador = ?',
                        [estadistica.idPartido, estadistica.idJugador]
                    );

                    if (!existingEstadisticaRows?.length && estadistica.idPartido && estadistica.idJugador && estadistica.idJornada && estadistica.idEquipo) {
                        const insertQuery = `INSERT INTO Estadisticas
                            (idPartido, idJornada, idEquipo, idJugador, Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados, Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques, Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis, AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados, PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles, ConduccionesProgresivas, EntradasOfensivas, EntradasConExito)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
                        await db.query(insertQuery, params);
                    }
                } catch (error: any) {
                    console.error('Error insertando estadística:', error.message);
                }
            }
        }

        // --- CSV DE PORTEROS (opcional) ---
        let filasPorteros = 0;
        if (filePorteros) {
            const abPorteros = await filePorteros.arrayBuffer();
            const bufPorteros = Buffer.from(abPorteros);
            const rowsPorteros = await parseCSVFromBuffer(bufPorteros);
            filasPorteros = await procesarPorteros(rowsPorteros, equiposMap, jornadasMap);
        }

        return NextResponse.json({
            message: 'CSV procesado correctamente',
            filas: rows.length,
            ...(filePorteros ? { filasPorteros } : {}),
        });
    } catch (error) {
        console.error('Error general procesando CSV:', error);
        return NextResponse.json({ message: 'Error procesando el CSV', error }, { status: 500 });
    }
}
