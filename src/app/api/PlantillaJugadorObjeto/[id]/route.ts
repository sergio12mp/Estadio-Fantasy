import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface PlantillaJugadorObjeto {
    idPlantilla: number;
    idJugador: number;
    idObjetos: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.plantillajugadorobjeto WHERE idPlantilla = ? AND idJugador = ?", [params.id]) as PlantillaJugadorObjeto[];
        if (!result.length) {
            console.log(`No se encontró la relación Plantilla-Jugador-Objeto con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró la relación Plantilla-Jugador-Objeto" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Relación Plantilla-Jugador-Objeto encontrada", result });
    } catch (error) {
        console.error("Error al obtener la relación Plantilla-Jugador-Objeto:", error);
        return NextResponse.json({ message: "Error al obtener la relación Plantilla-Jugador-Objeto", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { idPlantilla, idJugador, idObjetos } = await req.json();

        if (!idPlantilla || !idJugador || !idObjetos) {
            return NextResponse.json({ message: "idPlantilla, idJugador e idObjetos son requeridos" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.plantillajugadorobjeto SET idPlantilla = ?, idJugador = ?, idObjetos = ? WHERE idPlantilla = ? AND idJugador = ?", [idPlantilla, idJugador, idObjetos, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la relación Plantilla-Jugador-Objeto para actualizar" }, { status: 404 });
        }

        console.log("Relación Plantilla-Jugador-Objeto actualizada:", result);
        return NextResponse.json({ message: "Relación Plantilla-Jugador-Objeto actualizada exitosamente", result });
    } catch (error) {
        console.error("Error actualizando relación Plantilla-Jugador-Objeto:", error);
        return NextResponse.json({ message: "Error actualizando relación Plantilla-Jugador-Objeto", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.plantillajugadorobjeto WHERE idPlantilla = ? AND idJugador = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la relación Plantilla-Jugador-Objeto para eliminar" }, { status: 404 });
        }

        console.log("Relación Plantilla-Jugador-Objeto eliminada:", result);
        return NextResponse.json({ message: "Relación Plantilla-Jugador-Objeto eliminada exitosamente", result });
    } catch (error) {
        console.error("Error eliminando relación Plantilla-Jugador-Objeto:", error);
        return NextResponse.json({ message: "Error eliminando relación Plantilla-Jugador-Objeto", error }, { status: 500 });
    }
}
