import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Jornada {
    idJornada: number;
    Nombre: string;
    idTemporada: number;
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.jornada") as Jornada[];
        if (!result.length) {
            console.log("No se encontraron jornadas");
            return NextResponse.json({ message: "No se encontraron jornadas" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Jornadas encontradas", result });
    } catch (error) {
        console.error("Error al obtener las jornadas:", error);
        return NextResponse.json({ message: "Error al obtener las jornadas", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre, idTemporada } = await req.json();

        if (!Nombre || !idTemporada) {
            return NextResponse.json({ message: "Nombre y idTemporada son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.jornada (Nombre, idTemporada) VALUES (?, ?)", [Nombre, idTemporada]) as any;

        console.log("Jornada insertada:", result);
        return NextResponse.json({ message: "Jornada insertada exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando jornada:", error);
        return NextResponse.json({ message: "Error insertando jornada", error }, { status: 500 });
    }
}
