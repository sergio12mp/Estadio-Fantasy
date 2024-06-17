import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Equipo {
    idEquipo: number;
    Nombre: string;
    Estadisticas_idEstadisticas: number;
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.equipo") as Equipo[];
        if (!result.length) {
            console.log("No se encontraron equipos");
            return NextResponse.json({ message: "No se encontraron equipos" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Equipos encontrados", result });
    } catch (error) {
        console.error("Error al obtener los equipos:", error);
        return NextResponse.json({ message: "Error al obtener los equipos", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre, Estadisticas_idEstadisticas } = await req.json();

        if (!Nombre || !Estadisticas_idEstadisticas) {
            return NextResponse.json({ message: "Nombre y Estadisticas_idEstadisticas son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.equipo (Nombre, Estadisticas_idEstadisticas) VALUES (?, ?)", [Nombre, Estadisticas_idEstadisticas]) as any;

        console.log("Equipo insertado:", result);
        return NextResponse.json({ message: "Equipo insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando equipo:", error);
        return NextResponse.json({ message: "Error insertando equipo", error }, { status: 500 });
    }
}
