
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Participaciones {
    idManager: number;
    idLigas: number;
}


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.participaciones WHERE idManager = ?", [params.id]) as Participaciones[];
        if (!result.length) {
            console.log(`No se encontró la participación con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró la participación" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Participación encontrada", result });
    } catch (error) {
        console.error("Error al obtener la participación:", error);
        return NextResponse.json({ message: "Error al obtener la participación", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { idLigas } = await req.json();

        if (!idLigas) {
            return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.participaciones SET idLigas = ? WHERE idManager = ?", [idLigas, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la participación para actualizar" }, { status: 404 });
        }

        console.log("Participación actualizada:", result);
        return NextResponse.json({ message: "Participación actualizada exitosamente", result });
    } catch (error) {
        console.error("Error actualizando participación:", error);
        return NextResponse.json({ message: "Error actualizando participación", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.participaciones WHERE idManager = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la participación para eliminar" }, { status: 404 });
        }

        console.log("Participación eliminada:", result);
        return NextResponse.json({ message: "Participación eliminada exitosamente", result });
    } catch (error) {
        console.error("Error eliminando participación:", error);
        return NextResponse.json({ message: "Error eliminando participación", error }, { status: 500 });
    }
}