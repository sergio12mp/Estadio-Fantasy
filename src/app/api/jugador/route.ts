import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Jugador {
    idJugador: number;
    Nombre: string;
    Edad: string;
    Pais: string;
    Posicion: string;
    Precio: number;
    idEquipo: number;
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
        const { Nombre, Edad, Pais, Posicion, Precio, idEquipo } = await req.json();

        if (!Nombre || !Edad || !Pais || !Posicion || !Precio || !idEquipo) {
            return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.jugador (Nombre, Edad, Pais, Posicion, Precio, idEquipo) VALUES (?, ?, ?, ?, ?, ?)", [Nombre, Edad, Pais, Posicion, Precio, idEquipo]) as any;

        console.log("Jugador insertado:", result);
        return NextResponse.json({ message: "Jugador insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando jugador:", error);
        return NextResponse.json({ message: "Error insertando jugador", error }, { status: 500 });
    }
}
