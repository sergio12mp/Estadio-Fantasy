import { NextResponse } from "next/server";
import { db } from "@/lib/mysql";

// POST — calcula la jornada actual y avanza a la siguiente
export async function POST() {
    try {
        // 1. Obtener jornada actual
        const [configRows]: any = await db.query(
            "SELECT valor FROM Config WHERE clave = 'jornada_actual'"
        );
        if (!configRows?.length || !configRows[0].valor) {
            return NextResponse.json({ error: "No hay jornada actual configurada" }, { status: 400 });
        }
        const idJornadaActual = parseInt(configRows[0].valor);

        // 2. Calcular puntos de la jornada actual (llamada interna al endpoint de calcular)
        const calcRes = await fetch(
            `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/jornada/${idJornadaActual}/calcular`,
            { method: "POST" }
        );
        const calcData = await calcRes.json();
        if (!calcRes.ok) {
            return NextResponse.json({
                error: `Error al calcular jornada ${idJornadaActual}: ${calcData.error ?? calcData.message}`,
            }, { status: 500 });
        }

        // 3. Buscar la siguiente jornada con estadísticas
        const [siguiente]: any = await db.query(
            `SELECT DISTINCT E.idJornada, J.Nombre
             FROM Estadisticas E
             JOIN Jornada J ON J.idJornada = E.idJornada
             WHERE E.idJornada > ?
             ORDER BY E.idJornada ASC
             LIMIT 1`,
            [idJornadaActual]
        );

        if (!siguiente?.length) {
            return NextResponse.json({
                message: `Jornada ${idJornadaActual} calculada. No hay más jornadas con datos.`,
                idJornadaCalculada: idJornadaActual,
                plantillasProcesadas: calcData.plantillasProcesadas ?? 0,
                hayMasJornadas: false,
            });
        }

        const idSiguiente = siguiente[0].idJornada;
        const nombreSiguiente = siguiente[0].Nombre;

        // 4. Actualizar jornada actual en Config
        await db.query(
            "UPDATE Config SET valor = ? WHERE clave = 'jornada_actual'",
            [String(idSiguiente)]
        );

        return NextResponse.json({
            message: `Jornada ${idJornadaActual} calculada. Ahora en jornada ${idSiguiente}: ${nombreSiguiente}`,
            idJornadaCalculada: idJornadaActual,
            plantillasProcesadas: calcData.plantillasProcesadas ?? 0,
            idJornadaNueva: idSiguiente,
            nombreJornadaNueva: nombreSiguiente,
            hayMasJornadas: true,
        });
    } catch (error: any) {
        console.error("Error avanzando jornada:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
