import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Temporada {
    idTemporada: number;
    Nombre: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.temporada WHERE idTemporada = ?", [params.id]) as Temporada[];
        if (!result.length) {
            console.log(`No se encontró la temporada con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró la temporada" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Temporada encontrada", result });
    } catch (error) {
        console.error("Error al obtener la temporada:", error);
        return NextResponse.json({ message: "Error al obtener la temporada", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { Nombre } = await req.json();

        if (!Nombre) {
            return NextResponse.json({ message: "Nombre es requerido" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.temporada SET Nombre = ? WHERE idTemporada = ?", [Nombre, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la temporada para actualizar" }, { status: 404 });
        }

        console.log("Temporada actualizada:", result);
        return NextResponse.json({ message: "Temporada actualizada exitosamente", result });
    } catch (error) {
        console.error("Error actualizando temporada:", error);
        return NextResponse.json({ message: "Error actualizando temporada", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.temporada WHERE idTemporada = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la temporada para eliminar" }, { status: 404 });
        }

        console.log("Temporada eliminada:", result);
        return NextResponse.json({ message: "Temporada eliminada exitosamente", result });
    } catch (error) {
        console.error("Error eliminando temporada:", error);
        return NextResponse.json({ message: "Error eliminando temporada", error }, { status: 500 });
    }
}
