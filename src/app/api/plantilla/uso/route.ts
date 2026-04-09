// GET /api/plantilla/uso?idJornada=X
// Devuelve el coste de uso de cada jugador para la jornada actual,
// basado en el % de managers que lo alinearon en la jornada anterior.
import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

// Coste base por rareza de jugador/objeto
const COSTE_BASE: Record<string, number> = {
    'Común':      1,
    'Comun':      1,
    'Raro':       2,
    'Rara':       2,
    'Épico':      3,
    'Epico':      3,
    'Épica':      3,
    'Epica':      3,
    'Legendario': 4,
    'Legendaria': 4,
};

// Tramos de incremento por uso (% de managers que alinearon al jugador)
function calcularIncremento(porcentaje: number): number {
    if (porcentaje <= 20) return 0;
    if (porcentaje <= 40) return 1;
    if (porcentaje <= 60) return 2;
    if (porcentaje <= 80) return 3;
    return 4; // 81-100%
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const idJornada = parseInt(searchParams.get("idJornada") ?? "");

        if (isNaN(idJornada)) {
            return NextResponse.json({ error: "Falta idJornada" }, { status: 400 });
        }

        // Leer límites de configuración
        const [configRows]: any = await db.query(
            `SELECT clave, valor FROM Config WHERE clave IN ('limite_jugadores_por_club', 'limite_uso_plantilla')`
        );
        const config: Record<string, number> = {};
        for (const row of (Array.isArray(configRows[0]) ? configRows[0] : configRows)) {
            config[row.clave] = parseInt(row.valor);
        }
        const limiteClub = config['limite_jugadores_por_club'] ?? 4;
        const limiteUso  = config['limite_uso_plantilla'] ?? 100;

        // Jornada anterior
        const [jornadaAnteriorRows]: any = await db.query(
            `SELECT idJornada FROM Jornada WHERE idJornada < ? ORDER BY idJornada DESC LIMIT 1`,
            [idJornada]
        );
        const jornadaAnteriorData = Array.isArray(jornadaAnteriorRows[0]) ? jornadaAnteriorRows[0] : jornadaAnteriorRows;
        const idJornadaAnterior: number | null = jornadaAnteriorData[0]?.idJornada ?? null;

        // Total de managers activos
        const [totalManagersRows]: any = await db.query(`SELECT COUNT(*) AS total FROM Manager`);
        const totalManagers: number = (Array.isArray(totalManagersRows[0]) ? totalManagersRows[0] : totalManagersRows)[0]?.total ?? 1;

        // Calcular incremento por jugador si hay jornada anterior
        const incrementoPorJugador: Record<number, number> = {};

        if (idJornadaAnterior !== null) {
            // Contar cuántos managers alinearon cada jugador en la jornada anterior
            const [usosRows]: any = await db.query(
                `SELECT cj.Jugador_idJugador AS idJugador, COUNT(DISTINCT p.idManager) AS numManagers
                 FROM Plantilla p
                 JOIN PlantillaJugadorObjeto pjo ON pjo.idPlantilla = p.idPlantilla
                 JOIN CartaJugador cj ON cj.idCartaJugador = pjo.idCartaJugador
                 WHERE p.idJornada = ?
                 GROUP BY cj.Jugador_idJugador`,
                [idJornadaAnterior]
            );
            const usosData = Array.isArray(usosRows[0]) ? usosRows[0] : usosRows;

            for (const row of usosData) {
                const porcentaje = (row.numManagers / totalManagers) * 100;
                incrementoPorJugador[row.idJugador] = calcularIncremento(porcentaje);
            }
        }

        // Obtener todos los jugadores con su rareza para calcular coste base
        const [jugadoresRows]: any = await db.query(
            `SELECT j.idJugador, cj.Rareza
             FROM Jugador j
             JOIN CartaJugador cj ON cj.Jugador_idJugador = j.idJugador
             GROUP BY j.idJugador, cj.Rareza`
        );
        const jugadoresData = Array.isArray(jugadoresRows[0]) ? jugadoresRows[0] : jugadoresRows;

        // Construir mapa de coste total por jugador
        // Si un jugador tiene varias rarezas (varias cartas), usamos la más alta que tenga el manager
        // Para el cálculo de incremento usamos el idJugador
        const costesPorJugador: Record<number, { costeBase: number; incremento: number; costeTotal: number }> = {};
        for (const row of jugadoresData) {
            const base = COSTE_BASE[row.Rareza] ?? 1;
            const inc  = incrementoPorJugador[row.idJugador] ?? 0;
            // Si ya existe entrada con mayor coste base (carta más rara), no sobreescribir
            if (!costesPorJugador[row.idJugador] || costesPorJugador[row.idJugador].costeBase < base) {
                costesPorJugador[row.idJugador] = {
                    costeBase:  base,
                    incremento: inc,
                    costeTotal: base + inc,
                };
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
