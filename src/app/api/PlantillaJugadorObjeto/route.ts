import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";
import { PlantillaJugadorObjeto } from "@/libs/data";

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.plantillajugadorobjeto") as PlantillaJugadorObjeto[];
        if (!result.length) {
            console.log("No se encontraron relaciones Plantilla-Jugador-Objeto");
            return NextResponse.json({ message: "No se encontraron relaciones Plantilla-Jugador-Objeto" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Relaciones Plantilla-Jugador-Objeto encontradas", result });
    } catch (error) {
        console.error("Error al obtener las relaciones Plantilla-Jugador-Objeto:", error);
        return NextResponse.json({ message: "Error al obtener las relaciones Plantilla-Jugador-Objeto", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { idPlantilla, idJugador, idObjetos } = await req.json();

        if (!idPlantilla || !idJugador || !idObjetos) {
            return NextResponse.json({ message: "idPlantilla, idJugador e idObjetos son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.plantillajugadorobjeto (idPlantilla, idJugador, idObjetos) VALUES (?, ?, ?)", [idPlantilla, idJugador, idObjetos]) as any;

        console.log("Relación Plantilla-Jugador-Objeto insertada:", result);
        return NextResponse.json({ message: "Relación Plantilla-Jugador-Objeto insertada exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando relación Plantilla-Jugador-Objeto:", error);
        return NextResponse.json({ message: "Error insertando relación Plantilla-Jugador-Objeto", error }, { status: 500 });
    }
}
