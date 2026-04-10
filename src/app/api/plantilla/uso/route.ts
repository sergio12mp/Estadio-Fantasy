// GET /api/plantilla/uso?idJornada=X
// Devuelve el coste de uso de cada jugador para la jornada actual,
// basado en el % de managers que lo alinearon en la jornada anterior.
import { NextRequest, NextResponse } from "next/server";
import { queryRows, queryOne } from "@/lib/db-utils";
import { COSTE_BASE_USO, USO_TRAMOS } from "@/lib/constants";

function calcularIncremento(porcentaje: number): number {
    return USO_TRAMOS.find(t => porcentaje <= t.hasta)?.incremento ?? 4;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const idJornada = parseInt(searchParams.get("idJornada") ?? "");

        if (isNaN(idJornada)) {
            return NextResponse.json({ error: "Falta idJornada" }, { status: 400 });
        }

        // Leer límites de configuración
        const configRows = await queryRows<{ clave: string; valor: string }>(
            `SELECT clave, valor FROM Config WHERE clave IN ('limite_jugadores_por_club', 'limite_uso_plantilla')`
        );
        const config: Record<string, number> = {};
        for (const row of configRows) config[row.clave] = parseInt(row.valor);
        const limiteClub = config['limite_jugadores_por_club'] ?? 4;
        const limiteUso  = config['limite_uso_plantilla'] ?? 100;

        // Jornada anterior
        const jornadaAnterior = await queryOne<{ idJornada: number }>(
            `SELECT idJornada FROM Jornada WHERE idJornada < ? ORDER BY idJornada DESC LIMIT 1`,
            [idJornada]
        );
        const idJornadaAnterior: number | null = jornadaAnterior?.idJornada ?? null;

        // Total de managers activos
        const totalRow = await queryOne<{ total: number }>(`SELECT COUNT(*) AS total FROM Manager`);
        const totalManagers: number = totalRow?.total ?? 1;

        // Calcular incremento por jugador si hay jornada anterior
        const incrementoPorJugador: Record<number, number> = {};

        if (idJornadaAnterior !== null) {
            const usosData = await queryRows<{ idJugador: number; numManagers: number }>(
                `SELECT cj.Jugador_idJugador AS idJugador, COUNT(DISTINCT p.idManager) AS numManagers
                 FROM Plantilla p
                 JOIN PlantillaJugadorObjeto pjo ON pjo.idPlantilla = p.idPlantilla
                 JOIN CartaJugador cj ON cj.idCartaJugador = pjo.idCartaJugador
                 WHERE p.idJornada = ?
                 GROUP BY cj.Jugador_idJugador`,
                [idJornadaAnterior]
            );

            for (const row of usosData) {
                const porcentaje = (row.numManagers / totalManagers) * 100;
                incrementoPorJugador[row.idJugador] = calcularIncremento(porcentaje);
            }
        }

        // Obtener todos los jugadores con su rareza para calcular coste base
        const jugadoresData = await queryRows<{ idJugador: number; Rareza: string }>(
            `SELECT j.idJugador, cj.Rareza
             FROM Jugador j
             JOIN CartaJugador cj ON cj.Jugador_idJugador = j.idJugador
             GROUP BY j.idJugador, cj.Rareza`
        );

        // Construir mapa de coste total por jugador (carta más rara gana si hay varias)
        const costesPorJugador: Record<number, { costeBase: number; incremento: number; costeTotal: number }> = {};
        for (const row of jugadoresData) {
            const base = COSTE_BASE_USO[row.Rareza] ?? 1;
            const inc  = incrementoPorJugador[row.idJugador] ?? 0;
            if (!costesPorJugador[row.idJugador] || costesPorJugador[row.idJugador].costeBase < base) {
                costesPorJugador[row.idJugador] = { costeBase: base, incremento: inc, costeTotal: base + inc };
            }
        }

        return NextResponse.json({
            limiteClub,
            limiteUso,
            idJornadaAnterior,
            totalManagers,
            costes: costesPorJugador,
        });

    } catch (error: any) {
        console.error("Error en /api/plantilla/uso:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
