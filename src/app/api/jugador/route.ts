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

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.jugador") as Jugador[];
        if (!result.length) {
            console.log("No se encontraron jugadores");
            return NextResponse.json({ message: "No se encontraron jugadores" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Jugadores encontrados", result });
    } catch (error) {
        console.error("Error al obtener los jugadores:", error);
        return NextResponse.json({ message: "Error al obtener los jugadores", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre, Pais, Posicion, Edad, Estadisticas_idEstadisticas, Estadisticas_idEstadisticas1, Equipo_idEquipo, Equipo_Estadisticas_idEstadisticas, CartaJugador_idCartaJugador } = await req.json();

        if (!Nombre || !Pais || !Posicion || !Edad || !Estadisticas_idEstadisticas || !Estadisticas_idEstadisticas1 || !Equipo_idEquipo || !Equipo_Estadisticas_idEstadisticas || !CartaJugador_idCartaJugador) {
            return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.jugador (Nombre, Pais, Posicion, Edad, Estadisticas_idEstadisticas, Estadisticas_idEstadisticas1, Equipo_idEquipo, Equipo_Estadisticas_idEstadisticas, CartaJugador_idCartaJugador) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [Nombre, Pais, Posicion, Edad, Estadisticas_idEstadisticas, Estadisticas_idEstadisticas1, Equipo_idEquipo, Equipo_Estadisticas_idEstadisticas, CartaJugador_idCartaJugador]) as any;

        console.log("Jugador insertado:", result);
        return NextResponse.json({ message: "Jugador insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando jugador:", error);
        return NextResponse.json({ message: "Error insertando jugador", error }, { status: 500 });
    }
}
