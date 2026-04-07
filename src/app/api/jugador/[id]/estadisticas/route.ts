// GET /api/jugador/[id]/estadisticas
// Devuelve info del jugador + todas sus estadísticas por jornada con desglose de puntos
import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

// Tabla de puntos por estadística según posición
const SCORING: Record<string, Record<string, number>> = {
    GK:  { Goles: -1, Asistencias: 4, TarjetasAmarillas: -1, TarjetasRojas: -3, Disparos: 0.5, DisparosPorteria: 0.5, Toques: 0, Entradas: 0.5, Intercepciones: 0.5, Bloqueos: 0.5, PasesCompletados: 0.05, PasesProgresivos: 0.5, AccionesCreadasDeGol: 2, AccionesCreadasDeTiro: 1, Paradas: 1.5, GolesEncajados: -1, PenaltisParados: 5 },
    DF:  { Goles: 6, Asistencias: 4, TarjetasAmarillas: -1, TarjetasRojas: -3, Disparos: 0.5, DisparosPorteria: 1, Toques: 0.05, Entradas: 1, Intercepciones: 1, Bloqueos: 1, PasesCompletados: 0.05, PasesProgresivos: 0.5, AccionesCreadasDeGol: 2, AccionesCreadasDeTiro: 1, Paradas: 0, GolesEncajados: -0.5, PenaltisParados: 0 },
    MF:  { Goles: 5, Asistencias: 5, TarjetasAmarillas: -1, TarjetasRojas: -3, Disparos: 0.5, DisparosPorteria: 1, Toques: 0.05, Entradas: 0.5, Intercepciones: 0.5, Bloqueos: 0.5, PasesCompletados: 0.1, PasesProgresivos: 1, AccionesCreadasDeGol: 3, AccionesCreadasDeTiro: 1.5, Paradas: 0, GolesEncajados: 0, PenaltisParados: 0 },
    FW:  { Goles: 4, Asistencias: 3, TarjetasAmarillas: -1, TarjetasRojas: -3, Disparos: 1, DisparosPorteria: 1.5, Toques: 0.05, Entradas: 0.5, Intercepciones: 0.5, Bloqueos: 0.5, PasesCompletados: 0.05, PasesProgresivos: 0.5, AccionesCreadasDeGol: 2, AccionesCreadasDeTiro: 1, Paradas: 0, GolesEncajados: 0, PenaltisParados: 0 },
};

const STAT_LABELS: Record<string, string> = {
    Goles: 'Goles', Asistencias: 'Asistencias', TarjetasAmarillas: 'T. Amarillas',
    TarjetasRojas: 'T. Rojas', Disparos: 'Disparos', DisparosPorteria: 'Disp. Portería',
    Toques: 'Toques', Entradas: 'Entradas', Intercepciones: 'Intercepciones', Bloqueos: 'Bloqueos',
    PasesCompletados: 'Pases Comp.', PasesProgresivos: 'Pases Prog.',
    AccionesCreadasDeGol: 'Acc. Gol', AccionesCreadasDeTiro: 'Acc. Tiro',
    Paradas: 'Paradas', GolesEncajados: 'Goles Enc.', PenaltisParados: 'Pen. Parados',
};

function getPosicionCategoria(posicion: string): string {
    const primera = (posicion ?? '').split(',')[0].trim().toUpperCase();
    if (primera === 'GK') return 'GK';
    if (['CB', 'RB', 'LB', 'WB', 'DF'].includes(primera)) return 'DF';
    if (['CM', 'DM', 'AM', 'LM', 'RM', 'MF'].includes(primera)) return 'MF';
    return 'FW';
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const idJugador = parseInt(params.id);
    if (isNaN(idJugador)) {
        return NextResponse.json({ error: "id inválido" }, { status: 400 });
    }

    try {
        // Info del jugador
        const [jugadorRows]: any = await db.query(
            `SELECT j.idJugador, j.Nombre, j.Posicion, j.Edad, j.Pais, j.Precio, e.Nombre AS NombreEquipo
             FROM Jugador j JOIN Equipo e ON j.idEquipo = e.idEquipo
             WHERE j.idJugador = ?`,
            [idJugador]
        );
        const jugadorData = Array.isArray(jugadorRows[0]) ? jugadorRows[0] : jugadorRows;
        const jugador = jugadorData[0];
        if (!jugador) return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 });

        // Estadísticas por jornada
        const [statsRows]: any = await db.query(
            `SELECT es.idJornada, j.Nombre AS NombreJornada, es.Puntos,
                    es.Goles, es.Asistencias, es.TarjetasAmarillas, es.TarjetasRojas,
                    es.Disparos, es.DisparosPorteria, es.Toques, es.Entradas,
                    es.Intercepciones, es.Bloqueos, es.PasesCompletados, es.PasesProgresivos,
                    es.AccionesCreadasDeGol, es.AccionesCreadasDeTiro,
                    es.Paradas, es.GolesEncajados, es.PenaltisParados,
                    es.TirosPenalti, es.TirosPenaltiIntentados
             FROM Estadisticas es
             JOIN Jornada j ON es.idJornada = j.idJornada
             WHERE es.idJugador = ? AND es.Puntos IS NOT NULL
             ORDER BY es.idJornada ASC`,
            [idJugador]
        );
        const statsData = Array.isArray(statsRows[0]) ? statsRows[0] : statsRows;

        const posCategoria = getPosicionCategoria(jugador.Posicion);
        const scoringTable = SCORING[posCategoria] ?? SCORING['FW'];

        const estadisticas = statsData.map((row: any) => {
            const desglose: Array<{ stat: string; label: string; valor: number; puntos: number }> = [];
            for (const [stat, ptsPorUnidad] of Object.entries(scoringTable)) {
                const valor = row[stat] ?? 0;
                if (valor === 0) continue;
                const puntos = parseFloat((valor * ptsPorUnidad).toFixed(2));
                desglose.push({ stat, label: STAT_LABELS[stat] ?? stat, valor, puntos });
            }
            return {
                idJornada: row.idJornada,
                NombreJornada: row.NombreJornada,
                Puntos: row.Puntos,
                desglose,
            };
        });

        return NextResponse.json({ jugador, estadisticas });
    } catch (error: any) {
        console.error("Error estadisticas jugador:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
