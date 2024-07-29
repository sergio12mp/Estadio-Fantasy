import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";
import  { Estadisticas } from "@/libs/data";

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.estadisticas") as Estadisticas[];
        if (!result.length) {
            console.log("No se encontraron estadísticas");
            return NextResponse.json({ message: "No se encontraron estadísticas" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Estadísticas encontradas", result });
    } catch (error) {
        console.error("Error al obtener las estadísticas:", error);
        return NextResponse.json({ message: "Error al obtener las estadísticas", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const {
            idPartido, idJornada, idJugador, idEquipo,
            Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados,
            Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques,
            Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis,
            AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados,
            PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles,
            ConduccionesProgresivas, EntradasOfensivas, EntradasConExito
        } = await req.json();

        if (!idPartido || !idJornada || !idJugador || !idEquipo) {
            return NextResponse.json({ message: "idPartido, idJornada, idJugador e idEquipo son requeridos" }, { status: 400 });
        }

        const result = await db.query(`
            INSERT INTO mydb.estadisticas (
                idPartido, idJornada, idJugador, idEquipo,
                Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados,
                Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques,
                Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis,
                AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados,
                PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles,
                ConduccionesProgresivas, EntradasOfensivas, EntradasConExito
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            idPartido, idJornada, idJugador, idEquipo,
            Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados,
            Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques,
            Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis,
            AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados,
            PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles,
            ConduccionesProgresivas, EntradasOfensivas, EntradasConExito
        ]) as any;

        console.log("Estadísticas insertadas:", result);
        return NextResponse.json({ message: "Estadísticas insertadas exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando estadísticas:", error);
        return NextResponse.json({ message: "Error insertando estadísticas", error }, { status: 500 });
    }
}
