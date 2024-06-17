import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Temporada {
    idTemporada: number;
    Nombre: string;
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.temporada") as Temporada[];
        if (!result.length) {
            console.log("No se encontraron temporadas");
            return NextResponse.json({ message: "No se encontraron temporadas" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Temporadas encontradas", result });
    } catch (error) {
        console.error("Error al obtener las temporadas:", error);
        return NextResponse.json({ message: "Error al obtener las temporadas", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre } = await req.json();

        if (!Nombre) {
            return NextResponse.json({ message: "Nombre es requerido" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.temporada (Nombre) VALUES (?)", [Nombre]) as any;

        console.log("Temporada insertada:", result);
        return NextResponse.json({ message: "Temporada insertada exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando temporada:", error);
        return NextResponse.json({ message: "Error insertando temporada", error }, { status: 500 });
    }
}
