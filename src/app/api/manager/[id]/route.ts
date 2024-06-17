import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Manager {
    idManager: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.manager WHERE idManager = ?", [params.id]) as Manager[];
        if (!result.length) {
            console.log(`No se encontró el manager con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró el manager" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Manager encontrado", result });
    } catch (error) {
        console.error("Error al obtener el manager:", error);
        return NextResponse.json({ message: "Error al obtener el manager", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { idManager } = await req.json();

        if (!idManager) {
            return NextResponse.json({ message: "idManager es requerido" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.manager SET idManager = ? WHERE idManager = ?", [idManager, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el manager para actualizar" }, { status: 404 });
        }

        console.log("Manager actualizado:", result);
        return NextResponse.json({ message: "Manager actualizado exitosamente", result });
    } catch (error) {
        console.error("Error actualizando manager:", error);
        return NextResponse.json({ message: "Error actualizando manager", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.manager WHERE idManager = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el manager para eliminar" }, { status: 404 });
        }

        console.log("Manager eliminado:", result);
        return NextResponse.json({ message: "Manager eliminado exitosamente", result });
    } catch (error){
        console.error("Error eliminando manager:", error);
        return NextResponse.json({ message: "Error eliminando manager", error }, { status: 500 });
    }
}