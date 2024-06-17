import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Equipo {
    idEquipo: number;
    Nombre: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.equipo WHERE idEquipo = ?", [params.id]) as Equipo[];
        if (!result.length) {
            console.log(`No se encontró el equipo con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró el equipo" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Equipo encontrado", result });
    } catch (error) {
        console.error("Error al obtener el equipo:", error);
        return NextResponse.json({ message: "Error al obtener el equipo", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { Nombre } = await req.json();

        if (!Nombre) {
            return NextResponse.json({ message: "Nombre es requerido" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.equipo SET Nombre = ? WHERE idEquipo = ?", [Nombre, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el equipo para actualizar" }, { status: 404 });
        }

        console.log("Equipo actualizado:", result);
        return NextResponse.json({ message: "Equipo actualizado exitosamente", result });
    } catch (error) {
        console.error("Error actualizando equipo:", error);
        return NextResponse.json({ message: "Error actualizando equipo", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.equipo WHERE idEquipo = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el equipo para eliminar" }, { status: 404 });
        }

        console.log("Equipo eliminado:", result);
        return NextResponse.json({ message: "Equipo eliminado exitosamente", result });
    } catch (error) {
        console.error("Error eliminando equipo:", error);
        return NextResponse.json({ message: "Error eliminando equipo", error }, { status: 500 });
    }
}
