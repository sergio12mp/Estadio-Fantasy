import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

// Posiciones del CSV → categoría para selección
const POSICION_CATEGORIA: Record<string, string> = {
    GK: "PORTERO",
    DF: "DEFENSA", CB: "DEFENSA", RB: "DEFENSA", LB: "DEFENSA", WB: "DEFENSA",
    MF: "CENTROCAMPISTA", DM: "CENTROCAMPISTA", CM: "CENTROCAMPISTA",
    LM: "CENTROCAMPISTA", RM: "CENTROCAMPISTA", AM: "CENTROCAMPISTA",
    FW: "DELANTERO", LW: "DELANTERO", RW: "DELANTERO", ST: "DELANTERO",
};

// Cuántos jugadores por categoría en la formación 4-3-3
const SLOTS: Record<string, number> = {
    PORTERO: 1,
    DEFENSA: 4,
    CENTROCAMPISTA: 3,
    DELANTERO: 3,
};

function categoriaDeJugador(posicion: string): string {
    const primera = posicion.split(",")[0].trim();
    return POSICION_CATEGORIA[primera] ?? "CENTROCAMPISTA";
}

export async function POST(req: NextRequest) {
    const { idJornada } = await req.json();
    if (!idJornada || isNaN(Number(idJornada))) {
        return NextResponse.json({ error: "idJornada requerido" }, { status: 400 });
    }
    const jornadaId = Number(idJornada);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Obtener todos los bots
        const [bots]: any = await connection.query(
            "SELECT idManager FROM Manager WHERE isBot = 1"
        );
        if (!bots?.length) {
            await connection.rollback();
            return NextResponse.json({ error: "No hay bots. Ejecuta primero /api/bots/seed" }, { status: 400 });
        }

        // ¿Hay historial de puntos de jornadas anteriores?
        const [jornadasPrevias]: any = await connection.query(
            "SELECT COUNT(*) AS total FROM Estadisticas WHERE Puntos IS NOT NULL AND idJornada < ?",
            [jornadaId]
        );
        const usarHistorial = Number(jornadasPrevias[0]?.total ?? 0) > 0;

        let botsAsignados = 0;

        for (const bot of bots) {
            const idManager = bot.idManager;

            // Si ya tiene plantilla para esta jornada, saltar
            const [plantillaExistente]: any = await connection.query(
                "SELECT idPlantilla FROM Plantilla WHERE idManager = ? AND idJornada = ?",
                [idManager, jornadaId]
            );
            if (plantillaExistente?.length) continue;

            // Obtener todas las cartas del bot con info del jugador
            const [cartas]: any = await connection.query(
                `SELECT CJ.idCartaJugador, J.idJugador, J.Posicion, J.Precio
                 FROM CartaJugador CJ
                 JOIN Jugador J ON CJ.Jugador_idJugador = J.idJugador
                 WHERE CJ.Manager_idManager = ?`,
                [idManager]
            );

            // Puntuar cada carta según el criterio elegido
            let cartasConPuntos: Array<{ idCartaJugador: number; categoria: string; score: number }> = [];

            if (usarHistorial) {
                // Obtener las últimas 3 jornadas globales con estadísticas
                const [ultimasJornadas]: any = await connection.query(
                    "SELECT DISTINCT idJornada FROM Estadisticas WHERE Puntos IS NOT NULL ORDER BY idJornada DESC LIMIT 3"
                );
                const jornadaIds: number[] = (ultimasJornadas as any[]).map((r: any) => r.idJornada);

                // Promedio de puntos en las últimas 3 jornadas
                const inPlaceholders = jornadaIds.length > 0 ? jornadaIds.map(() => '?').join(',') : 'NULL';
                const [historial]: any = await connection.query(
                    `SELECT J.idJugador, J.Posicion, J.Precio,
                            AVG(E.Puntos) AS avgPuntos
                     FROM CartaJugador CJ
                     JOIN Jugador J ON CJ.Jugador_idJugador = J.idJugador
                     LEFT JOIN Estadisticas E ON E.idJugador = J.idJugador
                         AND E.Puntos IS NOT NULL
                         AND E.idJornada IN (${inPlaceholders})
                     WHERE CJ.Manager_idManager = ?
                     GROUP BY CJ.idCartaJugador, J.idJugador, J.Posicion, J.Precio`,
                    [...jornadaIds, idManager]
                );

                // Construir mapa idJugador → avgPuntos
                const avgMap = new Map<number, number>();
                for (const row of historial) {
                    avgMap.set(row.idJugador, parseFloat(row.avgPuntos ?? "0") || 0);
                }

                cartasConPuntos = cartas.map((c: any) => ({
                    idCartaJugador: c.idCartaJugador,
                    categoria: categoriaDeJugador(c.Posicion),
                    score: avgMap.get(c.idJugador) ?? 0,
                }));
            } else {
                // Sin historial: usar Precio como proxy de calidad
                cartasConPuntos = cartas.map((c: any) => ({
                    idCartaJugador: c.idCartaJugador,
                    categoria: categoriaDeJugador(c.Posicion),
                    score: Number(c.Precio) || 0,
                }));
            }

            // Seleccionar los mejores por categoría según los slots de 4-3-3
            const seleccionados: number[] = [];
            for (const [categoria, slots] of Object.entries(SLOTS)) {
                const candidatos = cartasConPuntos
                    .filter(c => c.categoria === categoria)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, slots);
                seleccionados.push(...candidatos.map(c => c.idCartaJugador));
            }

            if (seleccionados.length === 0) continue;

            // Crear plantilla
            const [plantillaResult]: any = await connection.query(
                "INSERT INTO Plantilla (Alineacion, idJornada, idManager) VALUES (?, ?, ?)",
                ["4-3-3", jornadaId, idManager]
            );
            const idPlantilla = plantillaResult.insertId;

            // Insertar jugadores en la plantilla
            for (let i = 0; i < seleccionados.length; i++) {
                await connection.query(
                    "INSERT INTO PlantillaJugadorObjeto (idPlantilla, idCartaJugador, posicionEnPlantilla) VALUES (?, ?, ?)",
                    [idPlantilla, seleccionados[i], i]
                );
            }

            botsAsignados++;
        }

        await connection.commit();
        return NextResponse.json({
            message: `Plantillas de bots establecidas para jornada ${jornadaId}`,
            botsAsignados,
            criterio: usarHistorial ? "promedio últimas 3 jornadas" : "precio",
        });
    } catch (error: any) {
        await connection.rollback();
        console.error("Error estableciendo plantillas de bots:", error);
        return NextResponse.json({ error: "Error al establecer plantillas", detail: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}
