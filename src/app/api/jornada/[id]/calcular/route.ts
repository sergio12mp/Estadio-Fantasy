// src/app/api/jornada/[id]/calcular/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import { PoolConnection } from "mysql2/promise";

// Define el sistema de puntuación
const SCORING_SYSTEM = {
    PORTERO: {
        // Puntos por tramos (1 punto por cada N acciones)
        MinutosPorPunto: 10,
        DisparosPorPunto: 0, // No suma puntos por disparos
        DisparosPorteriaPorPunto: 2,
        ToquesPorPunto: 10,
        EntradasPorPunto: 10,
        IntercepcionesPorPunto: 10,
        BloqueosPorPunto: 10,
        AccionesCreadasDeTiroPorPunto: 1,
        AccionesCreadasDeGolPorPunto: 2,
        PasesCompletadosPorPunto: 20,
        PasesIntentadosPorPunto: 0,
        PasesProgresivosPorPunto: 30,
        ControlesPorPunto: 22,
        ConduccionesProgresivasPorPunto: 27,
        EntradasOfensivasPorPunto: 35,
        EntradasConExitoPorPunto: 1,
        // Estadísticas específicas de portero (1 punto por cada N paradas)
        ParadasPorPunto: 3,

        // Puntos por multiplicador
        Goles: 6,
        Asistencias: 3,
        TirosPenalti: 3,
        TirosPenaltiIntentados: 0,
        TarjetasAmarillas: -3,
        TarjetasRojas: -5,
        // Específico portero
        GolesEncajados: -1,      // -1 por cada gol encajado
        PorteriaACero: 5,        // +5 si no encaja ningún gol
        PenaltisParados: 5,      // +5 por penalti parado

        // Puntos por umbral
        PorcentajePasesCompletados: [
            { threshold: 70, points: 2 },
            { threshold: 80, points: 3 },
            { threshold: 90, points: 4 }
        ]
    },
    DEFENSA: {
        // Puntos por tramos
        MinutosPorPunto: 10,
        DisparosPorPunto: 3,
        DisparosPorteriaPorPunto: 2,
        ToquesPorPunto: 30,
        EntradasPorPunto: 10,
        IntercepcionesPorPunto: 10,
        BloqueosPorPunto: 5,
        AccionesCreadasDeTiroPorPunto: 3,
        AccionesCreadasDeGolPorPunto: 2,
        PasesCompletadosPorPunto: 40,
        PasesIntentadosPorPunto: 0,
        PasesProgresivosPorPunto: 20,
        ControlesPorPunto: 30,
        ConduccionesProgresivasPorPunto: 80,
        EntradasOfensivasPorPunto: 4,
        EntradasConExitoPorPunto: 2,

        // Puntos por multiplicador
        Goles: 5,
        Asistencias: 4,
        TirosPenalti: 3,
        TirosPenaltiIntentados: 0,
        TarjetasAmarillas: -3,
        TarjetasRojas: -5,

        // Puntos por umbral
        PorcentajePasesCompletados: [
            { threshold: 70, points: 1 },
            { threshold: 80, points: 3 },
            { threshold: 90, points: 5 }
        ]
    },
    CENTROCAMPISTA: {
        // Puntos por tramos
        MinutosPorPunto: 10,
        DisparosPorPunto: 4,
        DisparosPorteriaPorPunto: 2,
        ToquesPorPunto: 20,
        EntradasPorPunto: 10,
        IntercepcionesPorPunto: 10,
        BloqueosPorPunto: 4,
        AccionesCreadasDeTiroPorPunto: 4,
        AccionesCreadasDeGolPorPunto: 3,
        PasesCompletadosPorPunto: 40,
        PasesIntentadosPorPunto: 0,
        PasesProgresivosPorPunto: 20,
        ControlesPorPunto: 30,
        ConduccionesProgresivasPorPunto: 80,
        EntradasOfensivasPorPunto: 2,
        EntradasConExitoPorPunto: 2,

        // Puntos por multiplicador
        Goles: 4,
        Asistencias: 3,
        TirosPenalti: 3,
        TirosPenaltiIntentados: 0,
        TarjetasAmarillas: -3,
        TarjetasRojas: -5,

        // Puntos por umbral
        PorcentajePasesCompletados: [
            { threshold: 70, points: 1 },
            { threshold: 80, points: 3 },
            { threshold: 90, points: 5 }
        ]
    },
    DELANTERO: {
        // Puntos por tramos
        MinutosPorPunto: 10,
        DisparosPorPunto: 5,
        DisparosPorteriaPorPunto: 3,
        ToquesPorPunto: 10,
        EntradasPorPunto: 10,
        IntercepcionesPorPunto: 10,
        BloqueosPorPunto: 3,
        AccionesCreadasDeTiroPorPunto: 5,
        AccionesCreadasDeGolPorPunto: 4,
        PasesCompletadosPorPunto: 10,
        PasesIntentadosPorPunto: 0,
        PasesProgresivosPorPunto: 30,
        ControlesPorPunto: 20,
        ConduccionesProgresivasPorPunto: 30,
        EntradasOfensivasPorPunto: 80,
        EntradasConExitoPorPunto: 3,

        // Puntos por multiplicador
        Goles: 3,
        Asistencias: 2,
        TirosPenalti: 3,
        TirosPenaltiIntentados: 0,
        TarjetasAmarillas: -3,
        TarjetasRojas: -5,

        // Puntos por umbral
        PorcentajePasesCompletados: [
            { threshold: 70, points: 1 },
            { threshold: 80, points: 3 },
            { threshold: 90, points: 5 }
        ]
    },
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    let connection: PoolConnection | null = null;
    try {
        const jornada = parseInt(params.id);

        if (isNaN(jornada)) {
            return NextResponse.json({ message: "ID de jornada inválido" }, { status: 400 });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // -----------------------------------------------------------
        // PARTE 1: CALCULAR PUNTOS DE CADA JUGADOR EN 'estadisticas'
        // -----------------------------------------------------------
        const [statsDeJornada]: any = await connection.query(
            "SELECT E.*, J.Posicion FROM Estadisticas AS E JOIN Jugador AS J ON E.idJugador = J.idJugador WHERE E.idJornada = ?",
            [jornada]
        );

        if (statsDeJornada.length === 0) {
            await connection.rollback();
            return NextResponse.json({ message: "No se encontraron estadísticas para esta jornada." }, { status: 404 });
        }

        const posicionMap: { [key: string]: string } = {
            'GK': 'PORTERO',
            'DF': 'DEFENSA', 'CB': 'DEFENSA', 'RB': 'DEFENSA', 'LB': 'DEFENSA', 'WB': 'DEFENSA',
            'MF': 'CENTROCAMPISTA', 'DM': 'CENTROCAMPISTA', 'CM': 'CENTROCAMPISTA', 'LM': 'CENTROCAMPISTA', 'RM': 'CENTROCAMPISTA', 'AM': 'CENTROCAMPISTA',
            'FW': 'DELANTERO', 'LW': 'DELANTERO', 'RW': 'DELANTERO', 'ST': 'DELANTERO'
        };

        const integerPointStats = [
            'Disparos', 'DisparosPorteria', 'Toques', 'Entradas', 'Intercepciones', 'Bloqueos',
            'AccionesCreadasDeTiro', 'AccionesCreadasDeGol', 'PasesCompletados',
            'PasesIntentados', 'PasesProgresivos', 'Controles',
            'ConduccionesProgresivas', 'EntradasOfensivas', 'EntradasConExito'
        ];

        const multiplierStats = [
            'Goles', 'Asistencias', 'TirosPenalti', 'TirosPenaltiIntentados',
            'TarjetasAmarillas', 'TarjetasRojas'
        ];

        for (const stats of statsDeJornada) {
            let puntuacionJugador = 0;
            // Un jugador puede tener posición compuesta ("CB,LB") — tomamos la primera
            const posicionRaw = (stats.Posicion as string).split(',')[0].trim();
            const posicionJugador = posicionMap[posicionRaw] || 'CENTROCAMPISTA';
            const sistema = SCORING_SYSTEM[posicionJugador as keyof typeof SCORING_SYSTEM];

            if (sistema) {
                // Minutos
                const minutos = stats.Minutos ?? 0;
                puntuacionJugador += Math.floor(minutos / sistema.MinutosPorPunto);

                // Estadísticas por tramos
                for (const statName of integerPointStats) {
                    const valorEstadistica = stats[statName] ?? 0;
                    const thresholdValue = sistema[`${statName}PorPunto` as keyof typeof sistema] as number;
                    if (thresholdValue > 0) {
                        puntuacionJugador += Math.floor(valorEstadistica / thresholdValue);
                    }
                }

                // Estadísticas multiplicadoras
                for (const statName of multiplierStats) {
                    const valorEstadistica = stats[statName] ?? 0;
                    const scoreValue = (sistema as any)[statName] as number;
                    puntuacionJugador += valorEstadistica * scoreValue;
                }

                // Umbral porcentaje de pases
                const porcentaje = stats.PorcentajePasesCompletados ?? 0;
                const umbrales = sistema.PorcentajePasesCompletados;
                if (porcentaje >= umbrales[2].threshold) {
                    puntuacionJugador += umbrales[2].points;
                } else if (porcentaje >= umbrales[1].threshold) {
                    puntuacionJugador += umbrales[1].points;
                } else if (porcentaje >= umbrales[0].threshold) {
                    puntuacionJugador += umbrales[0].points;
                }

                // Estadísticas exclusivas de portero (solo si se importó el CSV de porteros)
                if (posicionJugador === 'PORTERO') {
                    const portSistema = sistema as typeof SCORING_SYSTEM.PORTERO;
                    if (stats.Paradas != null) {
                        puntuacionJugador += Math.floor((stats.Paradas as number) / portSistema.ParadasPorPunto);
                    }
                    if (stats.GolesEncajados != null) {
                        puntuacionJugador += (stats.GolesEncajados as number) * portSistema.GolesEncajados;
                    }
                    if (stats.PorteriaACero != null) {
                        puntuacionJugador += (stats.PorteriaACero as number) * portSistema.PorteriaACero;
                    }
                    if (stats.PenaltisParados != null) {
                        puntuacionJugador += (stats.PenaltisParados as number) * portSistema.PenaltisParados;
                    }
                }
            }

            await connection.query(
                "UPDATE Estadisticas SET Puntos = ? WHERE idEstadisticas = ?",
                [parseFloat(puntuacionJugador.toFixed(2)), stats.idEstadisticas]
            );
        }

        // -----------------------------------------------------------
        // PARTE 2: CALCULAR PUNTOS DE CADA MANAGER SEGÚN SU PLANTILLA
        // Usa solo los jugadores de la plantilla guardada para esta jornada.
        // Aplica el ValorEfecto del objeto equipado a cada jugador.
        // Para ligas de club, los jugadores del equipo de la liga cuentan x2.
        // -----------------------------------------------------------
        const [plantillasDeJornada]: any = await connection.query(
            "SELECT idPlantilla, idManager FROM Plantilla WHERE idJornada = ?",
            [jornada]
        );

        for (const plantillaRow of plantillasDeJornada) {
            const { idPlantilla, idManager } = plantillaRow;

            // Suma base: puntos del jugador + bonus de su objeto equipado
            // - multiplicador: aplica (ValorEfecto - 1) * E.Puntos como bonus
            // - suma: aplica ValorEfecto * valor_de_la_estadistica como bonus
            // Calcular puntos base + bonus de hasta 3 objetos por jugador
            const bonusCaseSQL = (col: string) => `
                CASE
                    WHEN O${col}.Efecto = 'multiplicador' THEN E.Puntos * (O${col}.ValorEfecto - 1)
                    WHEN O${col}.Efecto = 'suma' THEN CASE O${col}.Estadistica
                        WHEN 'Goles'                  THEN E.Goles                  * O${col}.ValorEfecto
                        WHEN 'Asistencias'            THEN E.Asistencias            * O${col}.ValorEfecto
                        WHEN 'TirosPenalti'           THEN E.TirosPenalti           * O${col}.ValorEfecto
                        WHEN 'TirosPenaltiIntentados' THEN E.TirosPenaltiIntentados * O${col}.ValorEfecto
                        WHEN 'TarjetasAmarillas'      THEN E.TarjetasAmarillas      * O${col}.ValorEfecto
                        WHEN 'TarjetasRojas'          THEN E.TarjetasRojas          * O${col}.ValorEfecto
                        WHEN 'Disparos'               THEN E.Disparos               * O${col}.ValorEfecto
                        WHEN 'DisparosPorteria'       THEN E.DisparosPorteria       * O${col}.ValorEfecto
                        WHEN 'Toques'                 THEN E.Toques                 * O${col}.ValorEfecto
                        WHEN 'Entradas'               THEN E.Entradas               * O${col}.ValorEfecto
                        WHEN 'Intercepciones'         THEN E.Intercepciones         * O${col}.ValorEfecto
                        WHEN 'Bloqueos'               THEN E.Bloqueos               * O${col}.ValorEfecto
                        WHEN 'PasesCompletados'       THEN E.PasesCompletados       * O${col}.ValorEfecto
                        WHEN 'PasesProgresivos'       THEN E.PasesProgresivos       * O${col}.ValorEfecto
                        WHEN 'AccionesCreadasDeGol'   THEN E.AccionesCreadasDeGol   * O${col}.ValorEfecto
                        WHEN 'AccionesCreadasDeTiro'  THEN E.AccionesCreadasDeTiro  * O${col}.ValorEfecto
                        WHEN 'Paradas'                THEN COALESCE(E.Paradas, 0)   * O${col}.ValorEfecto
                        WHEN 'GolesEncajados'         THEN COALESCE(E.GolesEncajados, 0) * O${col}.ValorEfecto
                        WHEN 'PenaltisParados'        THEN COALESCE(E.PenaltisParados, 0) * O${col}.ValorEfecto
                        ELSE 0
                    END
                    ELSE 0
                END`;

            const [resultadoSuma]: any = await connection.query(
                `SELECT SUM(
                    E.Puntos
                    + ${bonusCaseSQL('1')}
                    + ${bonusCaseSQL('2')}
                    + ${bonusCaseSQL('3')}
                ) AS puntuacionTotal
                 FROM PlantillaJugadorObjeto AS PJO
                 JOIN CartaJugador AS CJ ON PJO.idCartaJugador = CJ.idCartaJugador
                 JOIN Estadisticas AS E ON E.idJugador = CJ.Jugador_idJugador AND E.idJornada = ?
                 LEFT JOIN CartaObjeto AS CO1 ON PJO.idCartaObjeto1 = CO1.idCartaObjeto
                 LEFT JOIN Objetos AS O1 ON CO1.idObjetos = O1.idObjetos
                 LEFT JOIN CartaObjeto AS CO2 ON PJO.idCartaObjeto2 = CO2.idCartaObjeto
                 LEFT JOIN Objetos AS O2 ON CO2.idObjetos = O2.idObjetos
                 LEFT JOIN CartaObjeto AS CO3 ON PJO.idCartaObjeto3 = CO3.idCartaObjeto
                 LEFT JOIN Objetos AS O3 ON CO3.idObjetos = O3.idObjetos
                 WHERE PJO.idPlantilla = ?`,
                [jornada, idPlantilla]
            );

            const puntuacionBase = parseFloat(
                (Number(resultadoSuma[0]?.puntuacionTotal) || 0).toFixed(2)
            );

            // Actualizar Plantilla.Puntos (puntuación base, sin bonus de liga)
            await connection.query(
                "UPDATE Plantilla SET Puntos = ? WHERE idPlantilla = ?",
                [puntuacionBase, idPlantilla]
            );

            // Actualizar Manager.puntuacion_actual (suma de todas sus jornadas, puntuación base)
            await connection.query(
                `UPDATE Manager
                 SET puntuacion_actual = (
                     SELECT COALESCE(SUM(Puntos), 0) FROM Plantilla WHERE idManager = ?
                 )
                 WHERE idManager = ?`,
                [idManager, idManager]
            );

            // Calcular puntuación por liga (con bonus x2 para ligas de club)
            const [ligasDelManager]: any = await connection.query(
                `SELECT L.idLigas, L.tipo, L.idEquipo
                 FROM Ligas AS L
                 JOIN Manager_Ligas AS ML ON L.idLigas = ML.Ligas_idLigas
                 WHERE ML.Manager_idManager = ?`,
                [idManager]
            );

            for (const liga of ligasDelManager) {
                // Puntuación base acumulada (todas las jornadas, sin bonus)
                const [baseTotalResult]: any = await connection.query(
                    `SELECT COALESCE(SUM(Puntos), 0) AS baseTotal FROM Plantilla WHERE idManager = ?`,
                    [idManager]
                );
                let totalPuntosLiga = parseFloat((Number(baseTotalResult[0]?.baseTotal) || 0).toFixed(2));

                if (liga.tipo === 'club' && liga.idEquipo) {
                    // Bonus acumulado: para cada jornada del manager, sumar los puntos de
                    // los jugadores del club de la liga (que ya cuentan en la base, añadimos otro tanto = x2)
                    const [bonusTotalResult]: any = await connection.query(
                        `SELECT COALESCE(SUM(
                            E.Puntos
                            + CASE
                                WHEN O.Efecto = 'multiplicador'
                                    THEN E.Puntos * (O.ValorEfecto - 1)
                                WHEN O.Efecto = 'suma'
                                    THEN CASE O.Estadistica
                                        WHEN 'Goles'                   THEN E.Goles                   * O.ValorEfecto
                                        WHEN 'Asistencias'             THEN E.Asistencias             * O.ValorEfecto
                                        WHEN 'TirosPenalti'            THEN E.TirosPenalti            * O.ValorEfecto
                                        WHEN 'TirosPenaltiIntentados'  THEN E.TirosPenaltiIntentados  * O.ValorEfecto
                                        WHEN 'TarjetasAmarillas'       THEN E.TarjetasAmarillas       * O.ValorEfecto
                                        WHEN 'TarjetasRojas'           THEN E.TarjetasRojas           * O.ValorEfecto
                                        WHEN 'Disparos'                THEN E.Disparos                * O.ValorEfecto
                                        WHEN 'DisparosPorteria'        THEN E.DisparosPorteria        * O.ValorEfecto
                                        WHEN 'Toques'                  THEN E.Toques                  * O.ValorEfecto
                                        WHEN 'Entradas'                THEN E.Entradas                * O.ValorEfecto
                                        WHEN 'Intercepciones'          THEN E.Intercepciones          * O.ValorEfecto
                                        WHEN 'Bloqueos'                THEN E.Bloqueos                * O.ValorEfecto
                                        WHEN 'PasesCompletados'        THEN E.PasesCompletados        * O.ValorEfecto
                                        WHEN 'PasesProgresivos'        THEN E.PasesProgresivos        * O.ValorEfecto
                                        WHEN 'AccionesCreadasDeGol'    THEN E.AccionesCreadasDeGol    * O.ValorEfecto
                                        WHEN 'AccionesCreadasDeTiro'   THEN E.AccionesCreadasDeTiro   * O.ValorEfecto
                                        WHEN 'Paradas'                 THEN COALESCE(E.Paradas, 0)    * O.ValorEfecto
                                        WHEN 'GolesEncajados'          THEN COALESCE(E.GolesEncajados, 0) * O.ValorEfecto
                                        WHEN 'PenaltisParados'         THEN COALESCE(E.PenaltisParados, 0) * O.ValorEfecto
                                        ELSE 0
                                    END
                                ELSE 0
                            END
                        ), 0) AS bonusTotal
                         FROM Plantilla AS P
                         JOIN PlantillaJugadorObjeto AS PJO ON PJO.idPlantilla = P.idPlantilla
                         JOIN CartaJugador AS CJ ON PJO.idCartaJugador = CJ.idCartaJugador
                         JOIN Jugador AS J ON CJ.Jugador_idJugador = J.idJugador
                         JOIN Estadisticas AS E ON E.idJugador = J.idJugador AND E.idJornada = P.idJornada
                         LEFT JOIN CartaObjeto AS CO ON PJO.idCartaObjeto = CO.idCartaObjeto
                         LEFT JOIN Objetos AS O ON CO.idObjetos = O.idObjetos
                         WHERE P.idManager = ? AND J.idEquipo = ?`,
                        [idManager, liga.idEquipo]
                    );
                    const bonusTotal = parseFloat((Number(bonusTotalResult[0]?.bonusTotal) || 0).toFixed(2));
                    totalPuntosLiga = parseFloat((totalPuntosLiga + bonusTotal).toFixed(2));
                }

                await connection.query(
                    `UPDATE Manager_Ligas SET puntuacion_actual = ?
                     WHERE Manager_idManager = ? AND Ligas_idLigas = ?`,
                    [totalPuntosLiga, idManager, liga.idLigas]
                );
            }
        }

        await connection.commit();
        return NextResponse.json({
            message: `Puntuaciones de la jornada ${jornada} calculadas con éxito.`,
            jugadoresProcesados: statsDeJornada.length,
            plantillasProcesadas: plantillasDeJornada.length,
        }, { status: 200 });

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error("ERROR CRÍTICO al calcular jornada:", error);
        return NextResponse.json(
            { message: "Error interno del servidor", error: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) connection.release();
    }
}
