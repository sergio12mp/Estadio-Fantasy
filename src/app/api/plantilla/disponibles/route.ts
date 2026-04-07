// GET /api/plantilla/disponibles?managerId=X
// Devuelve las jornadas en las que un manager tiene plantilla guardada
import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    if (!managerId || isNaN(Number(managerId))) {
        return NextResponse.json({ error: "managerId inválido" }, { status: 400 });
    }

    try {
        const [rows]: any = await db.query(
            `SELECT p.idJornada, j.Nombre
             FROM Plantilla p
             JOIN Jornada j ON p.idJornada = j.idJornada
             WHERE p.idManager = ?
             ORDER BY p.idJornada DESC`,
            [Number(managerId)]
        );

        const jornadas = Array.isArray(rows[0]) ? rows[0] : rows;
        return NextResponse.json({ jornadas });
    } catch (error: any) {
        console.error("Error al obtener jornadas disponibles:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
