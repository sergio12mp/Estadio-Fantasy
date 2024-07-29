import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";
import { Partido } from "@/libs/data";


export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.partido") as Partido[];
        if (!result.length) {
            console.log("No se encontraron partidos");
            return NextResponse.json({ message: "No se encontraron partidos" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Partidos encontrados", result });
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

        const result = await db.query("INSERT INTO mydb.partido (idJornada, idEquipoLocal, idEquipoVisitante) VALUES (?, ?, ?)", [idJornada, idEquipoLocal, idEquipoVisitante]) as any;

        console.log("Partido insertado:", result);
        return NextResponse.json({ message: "Partido insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando partido:", error);
        return NextResponse.json({ message: "Error insertando partido", error }, { status: 500 });
    }
}
