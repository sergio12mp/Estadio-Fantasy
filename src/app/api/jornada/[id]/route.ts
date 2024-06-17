import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Jornada {
    idJornada: number;
    Nombre: string;
    idTemporada: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.jornada WHERE idJornada = ?", [params.id]) as Jornada[];
        if (!result.length) {
            console.log(`No se encontró la jornada con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró la jornada" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Jornada encontrada", result });
    } catch (error) {
        console.error("Error al obtener la jornada:", error);
        return NextResponse.json({ message: "Error al obtener la jornada", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { Nombre, idTemporada } = await req.json();

        if (!Nombre || !idTemporada) {
            return NextResponse.json({ message: "Nombre y idTemporada son requeridos" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.jornada SET Nombre = ?, idTemporada = ? WHERE idJornada = ?", [Nombre, idTemporada, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la jornada para actualizar" }, { status: 404 });
        }

        console.log("Jornada actualizada:", result);
        return NextResponse.json({ message: "Jornada actualizada exitosamente", result });
    } catch (error) {
        console.error("Error actualizando jornada:", error);
        return NextResponse.json({ message: "Error actualizando jornada", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.jornada WHERE idJornada = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la jornada para eliminar" }, { status: 404 });
        }

        console.log("Jornada eliminada:", result);
        return NextResponse.json({ message: "Jornada eliminada exitosamente", result });
    } catch (error) {
        console.error("Error eliminando jornada:", error);
        return NextResponse.json({ message: "Error eliminando jornada", error }, { status: 500 });
    }
}
