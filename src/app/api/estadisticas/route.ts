import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Estadistica {
    idEstadisticas: number;
    Minutos: string;
    Goles: string;
    Asistencias: string;
    TirosPenalti: string;
    TirosPenaltiIntentados: string;
    Disparos: string;
    DisparosPorteria: string;
    TarjetasAmarillas: string;
    TarjetasRojas: string;
    Toques: string;
    Entradas: string;
    Intercepciones: string;
    Bloqueos: string;
    GolesEsperados: number;
    GolesEsperadosSinPenaltis: string;
    AsistenciasEsperadas: string;
    AccionesCreadasDeTiro: string;
    AccionesCreadasDeGol: string;
    PasesCompletados: string;
    PasesIntentados: string;
    PorcentajePasesCompletados: string;
    PasesProgresivos: string;
    Controles: string;
    ConduccionesProgresivas: string;
    EntradasOfensivas: string;
    EntradasConExito: string;
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.estadisticas") as Estadistica[];
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
        const { Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados, Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques, Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis, AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados, PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles, ConduccionesProgresivas, EntradasOfensivas, EntradasConExito } = await req.json();

        const result = await db.query("INSERT INTO mydb.estadisticas (Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados, Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques, Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis, AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados, PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles, ConduccionesProgresivas, EntradasOfensivas, EntradasConExito) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados, Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques, Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis, AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados, PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles, ConduccionesProgresivas, EntradasOfensivas, EntradasConExito]) as any;

        console.log("Estadística insertada:", result);
        return NextResponse.json({ message: "Estadística insertada exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando estadística:", error);
        return NextResponse.json({ message: "Error insertando estadística", error }, { status: 500 });
    }
}
