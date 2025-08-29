// src/app/api/jornada/[id]/calcular/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import { Connection } from "mysql2/promise";

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

        // Puntos por multiplicador
        Goles: 6,
        Asistencias: 3,
        TirosPenalti: 3,
        TirosPenaltiIntentados: 0,
        TarjetasAmarillas: -3,
        TarjetasRojas: -5,

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
    let connection: Connection | null = null;
    try {
        const jornada = parseInt(params.id);

        if (isNaN(jornada)) {
            return NextResponse.json({ message: "ID de jornada inválido" }, { status: 400 });
        }
        
        connection = await db.getConnection();
        await connection.beginTransaction();

        // -----------------------------------------------------------
        // PARTE 1: CALCULAR PUNTOS DE CADA JUGADOR EN LA TABLA 'estadisticas'
        // -----------------------------------------------------------
        console.log(`Calculando puntuaciones para cada jugador en la jornada ${jornada}...`);
        
        const [statsDeJornada]: any = await connection.query(
            "SELECT E.*, J.Posicion FROM estadisticas AS E JOIN Jugador AS J ON E.idJugador = J.idJugador WHERE E.idJornada = ?",
            [jornada]
        );

        if (statsDeJornada.length === 0) {
            await connection.rollback();
            return NextResponse.json({ message: "No se encontraron estadísticas para esta jornada. Asegúrate de haberlas cargado." }, { status: 404 });
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
            const posicionJugador = posicionMap[stats.Posicion] || 'CENTROCAMPISTA';
            const sistema = SCORING_SYSTEM[posicionJugador as keyof typeof SCORING_SYSTEM];
            let desglosePuntos: { [key: string]: string } = {};

            if (sistema) {
                // Cálculo de puntos de Minutos (1 punto por cada 10 minutos)
                const minutos = stats.Minutos ?? 0;
                const puntosMinutos = Math.floor(minutos / sistema.MinutosPorPunto);
                puntuacionJugador += puntosMinutos;
                desglosePuntos.Minutos = `${puntosMinutos.toFixed(2)} pts (jugados: ${minutos} mins)`;

                // Cálculo de puntos para estadísticas con lógica de puntos enteros por tramos
                for (const statName of integerPointStats) {
                    const valorEstadistica = stats[statName] ?? 0;
                    const thresholdKey = `${statName}PorPunto` as keyof typeof sistema;
                    const thresholdValue = sistema[thresholdKey];

                    if (thresholdValue > 0) {
                        const puntos = Math.floor(valorEstadistica / thresholdValue);
                        puntuacionJugador += puntos;
                        desglosePuntos[statName] = `${puntos.toFixed(2)} pts (${valorEstadistica} ${statName})`;
                    } else {
                        desglosePuntos[statName] = `0.00 pts (${valorEstadistica} ${statName})`;
                    }
                }
                
                // Cálculo de puntos para estadísticas con multiplicadores
                for (const statName of multiplierStats) {
                    const valorEstadistica = stats[statName] ?? 0;
                    const scoreValue = (sistema as any)[statName];
                    const puntos = valorEstadistica * scoreValue;
                    puntuacionJugador += puntos;
                    desglosePuntos[statName] = `${puntos.toFixed(2)} pts (${valorEstadistica} ${statName})`;
                }

                // Lógica específica para el porcentaje de pases completados (umbrales)
                const porcentaje = stats.PorcentajePasesCompletados ?? 0;
                const puntuacionPorcentaje = sistema.PorcentajePasesCompletados as Array<{ threshold: number; points: number }>;
                let puntosPasesPorcentaje = 0;

                if (porcentaje >= puntuacionPorcentaje[2].threshold) {
                    puntosPasesPorcentaje = puntuacionPorcentaje[2].points;
                } else if (porcentaje >= puntuacionPorcentaje[1].threshold) {
                    puntosPasesPorcentaje = puntuacionPorcentaje[1].points;
                } else if (porcentaje >= puntuacionPorcentaje[0].threshold) {
                    puntosPasesPorcentaje = puntuacionPorcentaje[0].points;
                }
                puntuacionJugador += puntosPasesPorcentaje;
                desglosePuntos.PorcentajePasesCompletados = `${puntosPasesPorcentaje.toFixed(2)} pts (${porcentaje} %)`;

                console.log(`\n--- Desglose de Puntuación para Jugador ID: ${stats.idJugador} (Posición: ${stats.Posicion}) ---`);
                console.table(desglosePuntos);
                console.log(`PUNTUACIÓN TOTAL DE JUGADOR: ${puntuacionJugador.toFixed(2)}`);
            }
            
            await connection.query(
                "UPDATE estadisticas SET Puntos = ? WHERE idEstadisticas = ?",
                [puntuacionJugador.toFixed(2), stats.idEstadisticas]
            );
        }
        
        console.log(`Puntuaciones de ${statsDeJornada.length} jugadores calculadas y guardadas.`);

        // -----------------------------------------------------------
        // PARTE 2: CALCULAR PUNTOS DE CADA MANAGER EN CADA LIGA
        // -----------------------------------------------------------
        const [allLeagues]: any = await connection.query("SELECT idLigas FROM Ligas WHERE Codigo IS NOT NULL");

        for (const league of allLeagues) {
            const ligaId = league.idLigas;
            const [managersInLiga]: any = await connection.query(
                "SELECT Manager_idManager FROM Manager_Ligas WHERE Ligas_idLigas = ?",
                [ligaId]
            );

            for (const managerRow of managersInLiga) {
                const managerId = managerRow.Manager_idManager;
                
                const [resultadoSuma]: any = await connection.query(
                    `SELECT SUM(E.Puntos) AS puntuacionTotal
                     FROM estadisticas AS E
                     JOIN CartaJugador AS CJ ON E.idJugador = CJ.Jugador_idJugador
                     WHERE CJ.Manager_idManager = ? AND E.idJornada = ?;`,
                    [managerId, jornada]
                );
                
                const puntuacionManager = Number(resultadoSuma[0]?.puntuacionTotal) || 0;
                
                await connection.query(
                    `INSERT INTO plantilla (idJornada, Puntos, idManager)
                     VALUES (?, ?, ?)
                     ON DUPLICATE KEY UPDATE Puntos = VALUES(Puntos);`,
                    [jornada, puntuacionManager.toFixed(2), managerId]
                );
                
                await connection.query(
                    `UPDATE Manager
                     SET puntuacion_actual = (
                         SELECT SUM(Puntos)
                         FROM plantilla
                         WHERE idManager = ?
                     )
                     WHERE idManager = ?;`,
                    [managerId, managerId]
                );
            }
        }

        await connection.commit();
        return NextResponse.json({ 
            message: `Puntuaciones de la jornada ${jornada} calculadas y actualizadas con éxito.` 
        }, { status: 200 });

    } catch (error: any) {
        if (connection) {
            await connection.rollback();
        }
        console.error("ERROR CRÍTICO: Fallo al calcular la jornada:", error);
        return NextResponse.json(
            { message: "Error interno del servidor", error: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}