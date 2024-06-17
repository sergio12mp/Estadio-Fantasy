import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Partido {
    idPartidos: number;
    Fecha: string;
    Jornada_idJornada: number;
    Estadisticas_idEstadisticas: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.partidos WHERE idPartidos = ?", [params.id]) as Partido[];
        if (!result.length) {
            console.log(`No se encontró el partido con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró el partido" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Partido encontrado", result });
    } catch (error) {
        console.error("Error al obtener el partido:", error);
        return NextResponse.json({ message: "Error al obtener el partido", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { Fecha, Jornada_idJornada, Estadisticas_idEstadisticas } = await req.json();

        if (!Fecha || !Jornada_idJornada || !Estadisticas_idEstadisticas) {
            return NextResponse.json({ message: "Fecha, Jornada_idJornada y Estadisticas_idEstadisticas son requeridos" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.partidos SET Fecha = ?, Jornada_idJornada = ?, Estadisticas_idEstadisticas = ? WHERE idPartidos = ?", [Fecha, Jornada_idJornada, Estadisticas_idEstadisticas, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el partido para actualizar" }, { status: 404 });
        }

        console.log("Partido actualizado:", result);
        return NextResponse.json({ message: "Partido actualizado exitosamente", result });
    } catch (error) {
        console.error("Error actualizando partido:", error);
        return NextResponse.json({ message: "Error actualizando partido", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.partidos WHERE idPartidos = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el partido para eliminar" }, { status: 404 });
        }

        console.log("Partido eliminado:", result);
        return NextResponse.json({ message: "Partido eliminado exitosamente", result });
    } catch (error) {
        console.error("Error eliminando partido:", error);
        return NextResponse.json({ message: "Error eliminando partido", error }, { status: 500 });
    }
}
