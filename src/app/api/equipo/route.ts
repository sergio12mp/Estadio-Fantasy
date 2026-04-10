import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import { queryRows } from "@/lib/db-utils";

export async function GET() {
    try {
        const result = await queryRows("SELECT * FROM Equipo");
        if (!result.length) {
            return NextResponse.json({ message: "No se encontraron equipos" }, { status: 404 });
        }
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error al obtener los equipos:", error);
        return NextResponse.json({ message: "Error al obtener los equipos", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre } = await req.json();

        if (!Nombre) {
            return NextResponse.json({ message: "Nombre es requerido" }, { status: 400 });
        }

        const [result] = await db.query("INSERT INTO Equipo (Nombre) VALUES (?)", [Nombre]) as [any, any];

        // console.log("Equipo insertado:", result);
        return NextResponse.json({ message: "Equipo insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando equipo:", error);
        return NextResponse.json({ message: "Error insertando equipo", error }, { status: 500 });
    }
}
