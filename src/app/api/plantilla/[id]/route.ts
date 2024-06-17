import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Plantilla {
    idPlantilla: number;
    Alineacion: string;
    Puntos: number;
    idJornada: number;
    idManager: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.plantilla WHERE idPlantilla = ?", [params.id]) as Plantilla[];
        if (!result.length) {
            console.log(`No se encontró la plantilla con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró la plantilla" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Plantilla encontrada", result });
    } catch (error) {
        console.error("Error al obtener la plantilla:", error);
        return NextResponse.json({ message: "Error al obtener la plantilla", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { Alineacion, Puntos, idJornada, idManager } = await req.json();

        if (!Alineacion || !Puntos || !idJornada || !idManager) {
            return NextResponse.json({ message: "Alineacion, Puntos, idJornada e idManager son requeridos" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error actualizando plantilla:", error);
        return NextResponse.json({ message: "Error actualizando plantilla", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.plantilla WHERE idPlantilla = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la plantilla para eliminar" }, { status: 404 });
        }

        console.log("Plantilla eliminada:", result);
        return NextResponse.json({ message: "Plantilla eliminada exitosamente", result });
    } catch (error){
        console.error("Error eliminando plantilla:", error);
        return NextResponse.json({ message: "Error eliminando plantilla", error }, { status: 500 });
    }
}
