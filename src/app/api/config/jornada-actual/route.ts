import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

// GET — devuelve la jornada actual configurada
export async function GET() {
    try {
        const [rows]: any = await db.query(
            "SELECT valor FROM Config WHERE clave = 'jornada_actual'"
        );

        let idJornada: number | null = rows?.[0]?.valor ? parseInt(rows[0].valor) : null;

        // Si no hay config, inicializar con la primera jornada que tenga estadísticas
        if (!idJornada) {
            const [primeras]: any = await db.query(
                "SELECT DISTINCT idJornada FROM Estadisticas ORDER BY idJornada ASC LIMIT 1"
            );
            if (!primeras?.length) {
                return NextResponse.json({ error: "No hay jornadas con datos" }, { status: 404 });
            }
            idJornada = primeras[0].idJornada;
            await db.query(
                "INSERT INTO Config (clave, valor) VALUES ('jornada_actual', ?) ON DUPLICATE KEY UPDATE valor = ?",
                [String(idJornada), String(idJornada)]
            );
        }

        const [jornadaInfo]: any = await db.query(
            "SELECT idJornada, Nombre FROM Jornada WHERE idJornada = ?",
            [idJornada]
        );

        return NextResponse.json({
            idJornada,
            nombre: jornadaInfo?.[0]?.Nombre ?? `Jornada ${idJornada}`,
        });
    } catch (error: any) {
        console.error("Error obteniendo jornada actual:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT { idJornada } — establece la jornada actual
export async function PUT(req: NextRequest) {
    try {
        const { idJornada } = await req.json();
        if (!idJornada || isNaN(Number(idJornada))) {
            return NextResponse.json({ error: "idJornada requerido" }, { status: 400 });
        }

        const [check]: any = await db.query(
            "SELECT idJornada FROM Jornada WHERE idJornada = ?",
            [Number(idJornada)]
        );
        if (!check?.length) {
            return NextResponse.json({ error: "Jornada no encontrada" }, { status: 404 });
        }

        await db.query(
            "INSERT INTO Config (clave, valor) VALUES ('jornada_actual', ?) ON DUPLICATE KEY UPDATE valor = ?",
            [String(idJornada), String(idJornada)]
        );

        const [jornadaInfo]: any = await db.query(
            "SELECT Nombre FROM Jornada WHERE idJornada = ?",
            [Number(idJornada)]
        );

        return NextResponse.json({
            message: "Jornada actual actualizada",
            idJornada: Number(idJornada),
            nombre: jornadaInfo?.[0]?.Nombre,
        });
    } catch (error: any) {
        console.error("Error actualizando jornada actual:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
