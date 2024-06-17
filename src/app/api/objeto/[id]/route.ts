import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Objeto {
    idObjeto: number;
    Nombre: string;
    Descripcion: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.objeto WHERE idObjeto = ?", [params.id]) as Objeto[];
        if (!result.length) {
            console.log(`No se encontró el objeto con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró el objeto" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Objeto encontrado", result });
    } catch (error) {
        console.error("Error al obtener el objeto:", error);
        return NextResponse.json({ message: "Error al obtener el objeto", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { Nombre, Descripcion } = await req.json();

        if (!Nombre || !Descripcion) {
            return NextResponse.json({ message: "Nombre y Descripcion son requeridos" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.objeto SET Nombre = ?, Descripcion = ? WHERE idObjeto = ?", [Nombre, Descripcion, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el objeto para actualizar" }, { status: 404 });
        }

        console.log("Objeto actualizado:", result);
        return NextResponse.json({ message: "Objeto actualizado exitosamente", result });
    } catch (error) {
        console.error("Error actualizando objeto:", error);
        return NextResponse.json({ message: "Error actualizando objeto", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.objeto WHERE idObjeto = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el objeto para eliminar" }, { status: 404 });
        }

        console.log("Objeto eliminado:", result);
        return NextResponse.json({ message: "Objeto eliminado exitosamente", result });
    } catch (error) {
        console.error("Error eliminando objeto:", error);
        return NextResponse.json({ message: "Error eliminando objeto", error }, { status: 500 });
    }
}
