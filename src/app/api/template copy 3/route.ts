import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Partido {
    idPartidos: number;
    Fecha: string;
    Jornada_idJornada: number;
    Estadisticas_idEstadisticas: number;
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.partidos") as Partido[];
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
        const { Fecha, Jornada_idJornada, Estadisticas_idEstadisticas } = await req.json();

        if (!Fecha || !Jornada_idJornada || !Estadisticas_idEstadisticas) {
            return NextResponse.json({ message: "Fecha, Jornada_idJornada y Estadisticas_idEstadisticas son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.partidos (Fecha, Jornada_idJornada, Estadisticas_idEstadisticas) VALUES (?, ?, ?)", [Fecha, Jornada_idJornada, Estadisticas_idEstadisticas]) as any;

        console.log("Partido insertado:", result);
        return NextResponse.json({ message: "Partido insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando partido:", error);
        return NextResponse.json({ message: "Error insertando partido", error }, { status: 500 });
    }
}
