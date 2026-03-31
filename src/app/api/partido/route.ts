import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const idJornada = searchParams.get("idJornada");

        let rows: any[];
        if (idJornada) {
            const [result] = await db.query(
                `SELECT P.idPartido, P.idJornada,
                        EL.Nombre AS NombreLocal,
                        EV.Nombre AS NombreVisitante
                 FROM partido AS P
                 JOIN equipo AS EL ON P.idEquipoLocal = EL.idEquipo
                 JOIN equipo AS EV ON P.idEquipoVisitante = EV.idEquipo
                 WHERE P.idJornada = ?
                 ORDER BY P.idPartido`,
                [idJornada]
            ) as [any[], any];
            rows = result;
        } else {
            const [result] = await db.query(
                `SELECT P.idPartido, P.idJornada,
                        EL.Nombre AS NombreLocal,
                        EV.Nombre AS NombreVisitante
                 FROM partido AS P
                 JOIN equipo AS EL ON P.idEquipoLocal = EL.idEquipo
                 JOIN equipo AS EV ON P.idEquipoVisitante = EV.idEquipo
                 ORDER BY P.idJornada, P.idPartido`
            ) as [any[], any];
            rows = result;
        }

        if (!rows.length) {
            return NextResponse.json({ partidos: [] }, { status: 200 });
        }
        return NextResponse.json({ partidos: rows });
    } catch (error) {
        console.error("Error al obtener los partidos:", error);
        return NextResponse.json({ message: "Error al obtener los partidos", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { idJornada, idEquipoLocal, idEquipoVisitante } = await req.json();

        if (!idJornada || !idEquipoLocal || !idEquipoVisitante) {
            return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
        }

        const [result] = await db.query(
            "INSERT INTO partido (idJornada, idEquipoLocal, idEquipoVisitante) VALUES (?, ?, ?)",
            [idJornada, idEquipoLocal, idEquipoVisitante]
        ) as [any, any];

        return NextResponse.json({ message: "Partido insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando partido:", error);
        return NextResponse.json({ message: "Error insertando partido", error }, { status: 500 });
    }
}
