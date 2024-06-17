import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";


export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
    try{
        const result = await db.query("SELECT * FROM mydb.ligas WHERE idLigas = ?", [params.id]);
        if (!result) {
            console.log("No se encontraron ligas");
            return NextResponse.json({ message: "No se encontraron ligas" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Liga encontrada", result });
    }catch (error) {
        console.error("Error al obtener la liga:", error);
        return NextResponse.json({ message: "Error al obtener la liga", error }, { status: 500 });
    }
    
}

export async function DELETE(req: NextRequest, {params}: {params: {id: string}}) {
    try{
        const result = await db.query("DELETE FROM mydb.ligas WHERE idLigas = ?", [params.id]);
        if (!result) {
            console.log("No se encontraron ligas");
            return NextResponse.json({ message: "No se encontraron ligas" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Liga eliminada", result });
    }catch (error) {
        console.error("Error al eliminar la liga:", error);
        return NextResponse.json({ message: "Error al eliminar la liga", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, {params}: {params: {id: string}}) {
    try{
        const { Nombre, Descripcion } = await req.json();
        if (!Nombre || !Descripcion) {
            return NextResponse.json({ message: "Nombre y Descripcion son requeridos" }, { status: 400 });
        }
        const result = await db.query("UPDATE mydb.ligas SET Nombre = ?, Descripcion = ? WHERE idLigas = ?", [Nombre, Descripcion, params.id]);
        console.log("Liga actualizada:", result);
        return NextResponse.json({ message: "Liga actualizada exitosamente", result });
    }catch (error) {
        console.error("Error al actualizar la liga:", error);
        return NextResponse.json({ message: "Error al actualizar la liga", error }, { status: 500 });
    }
}

