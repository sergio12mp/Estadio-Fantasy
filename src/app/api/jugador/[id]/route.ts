import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Jugador {
    idJugador: number;
    Nombre: string;
    Pais: string;
    Posicion: string;
    Edad: string;
    Estadisticas_idEstadisticas: number;
    Estadisticas_idEstadisticas1: number;
    Equipo_idEquipo: number;
    Equipo_Estadisticas_idEstadisticas: number;
    CartaJugador_idCartaJugador: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.jugador WHERE idJugador = ?", [params.id]) as Jugador[];
        if (!result.length) {
            console.log(`No se encontró el jugador con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró el jugador" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Jugador encontrado", result });
    } catch (error) {
        console.error("Error al obtener el jugador:", error);
        return NextResponse.json({ message: "Error al obtener el jugador", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { Nombre, Pais, Posicion, Edad, Estadisticas_idEstadisticas, Estadisticas_idEstadisticas1, Equipo_idEquipo, Equipo_Estadisticas_idEstadisticas, CartaJugador_idCartaJugador } = await req.json();

        if (!Nombre || !Pais || !Posicion || !Edad || !Estadisticas_idEstadisticas || !Estadisticas_idEstadisticas1 || !Equipo_idEquipo || !Equipo_Estadisticas_idEstadisticas || !CartaJugador_idCartaJugador) {
            return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
        }

        const result = await db.query("UPDATE mydb.jugador SET Nombre = ?, Pais = ?, Posicion = ?, Edad = ?, Estadisticas_idEstadisticas = ?, Estadisticas_idEstadisticas1 = ?, Equipo_idEquipo = ?, Equipo_Estadisticas_idEstadisticas = ?, CartaJugador_idCartaJugador = ? WHERE idJugador = ?", [Nombre, Pais, Posicion, Edad, Estadisticas_idEstadisticas, Estadisticas_idEstadisticas1, Equipo_idEquipo, Equipo_Estadisticas_idEstadisticas, CartaJugador_idCartaJugador, params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el jugador para actualizar" }, { status: 404 });
        }

        console.log("Jugador actualizado:", result);
        return NextResponse.json({ message: "Jugador actualizado exitosamente", result });
    } catch (error) {
        console.error("Error actualizando jugador:", error);
        return NextResponse.json({ message: "Error actualizando jugador", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.jugador WHERE idJugador = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró el jugador para eliminar" }, { status: 404 });
        }

        console.log("Jugador eliminado:", result);
        return NextResponse.json({ message: "Jugador eliminado exitosamente", result });
    } catch (error) {
        console.error("Error eliminando jugador:", error);
        return NextResponse.json({ message: "Error eliminando jugador", error }, { status: 500 });
    }
}
