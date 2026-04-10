// GET /api/plantilla/disponibles?managerId=X
// Devuelve las jornadas en las que un manager tiene plantilla guardada
import { NextRequest, NextResponse } from "next/server";
import { queryRows } from "@/lib/db-utils";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    if (!managerId || isNaN(Number(managerId))) {
        return NextResponse.json({ error: "managerId inválido" }, { status: 400 });
    }

    try {
        const jornadas = await queryRows(
            `SELECT p.idJornada, j.Nombre
             FROM Plantilla p
             JOIN Jornada j ON p.idJornada = j.idJornada
             WHERE p.idManager = ?
             ORDER BY p.idJornada DESC`,
            [Number(managerId)]
        );
        return NextResponse.json({ jornadas });
    } catch (error: any) {
        console.error("Error al obtener jornadas disponibles:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
