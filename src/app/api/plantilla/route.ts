import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";
import { Plantilla } from "@/libs/data";

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.plantilla") as Plantilla[];
        if (!result.length) {
            console.log("No se encontraron plantillas");
            return NextResponse.json({ message: "No se encontraron plantillas" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Plantillas encontradas", result });
    } catch (error) {
        console.error("Error al obtener las plantillas:", error);
        return NextResponse.json({ message: "Error al obtener las plantillas", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Alineacion, Puntos, idJornada, idManager } = await req.json();

        if (!Alineacion || !Puntos || !idJornada || !idManager) {
            return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.plantilla (Alineacion, Puntos, idJornada, idManager) VALUES (?, ?, ?, ?)", [Alineacion, Puntos, idJornada, idManager]) as any;

        console.log("Plantilla insertada:", result);
        return NextResponse.json({ message: "Plantilla insertada exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando plantilla:", error);
        return NextResponse.json({ message: "Error insertando plantilla", error }, { status: 500 });
    }
}
