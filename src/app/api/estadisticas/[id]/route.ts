import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Estadisticas {
    idEstadisticas: number;
    idPartido: number;
    idJornada: number;
    idJugador: number;
    idEquipo: number;
    Minutos: number;
    Goles: number;
    Asistencias: number;
    TirosPenalti: number;
    TirosPenaltiIntentados: number;
    Disparos: number;
    DisparosPorteria: number;
    TarjetasAmarillas: number;
    TarjetasRojas: number;
    Toques: number;
    Entradas: number;
    Intercepciones: number;
    Bloqueos: number;
    GolesEsperados: number;
    GolesEsperadosSinPenaltis: number;
    AsistenciasEsperadas: number;
    AccionesCreadasDeTiro: number;
    AccionesCreadasDeGol: number;
    PasesCompletados: number;
    PasesIntentados: number;
    PorcentajePasesCompletados: number;
    PasesProgresivos: number;
    Controles: number;
    ConduccionesProgresivas: number;
    EntradasOfensivas: number;
    EntradasConExito: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("SELECT * FROM mydb.estadisticas WHERE idEstadisticas = ?", [params.id]) as Estadisticas[];
        if (!result.length) {
            console.log(`No se encontró la estadística con ID ${params.id}`);
            return NextResponse.json({ message: "No se encontró la estadística" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Estadística encontrada", result });
    } catch (error) {
        console.error("Error al obtener la estadística:", error);
        return NextResponse.json({ message: "Error al obtener la estadística", error }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
            UPDATE mydb.estadisticas SET
                idPartido = ?, idJornada = ?, idJugador = ?, idEquipo = ?,
                Minutos = ?, Goles = ?, Asistencias = ?, TirosPenalti = ?, TirosPenaltiIntentados = ?,
                Disparos = ?, DisparosPorteria = ?, TarjetasAmarillas = ?, TarjetasRojas = ?, Toques = ?,
                Entradas = ?, Intercepciones = ?, Bloqueos = ?, GolesEsperados = ?, GolesEsperadosSinPenaltis = ?,
                AsistenciasEsperadas = ?, AccionesCreadasDeTiro = ?, AccionesCreadasDeGol = ?, PasesCompletados = ?,
                PasesIntentados = ?, PorcentajePasesCompletados = ?, PasesProgresivos = ?, Controles = ?,
                ConduccionesProgresivas = ?, EntradasOfensivas = ?, EntradasConExito = ?
            WHERE idEstadisticas = ?
        `, [
            idPartido, idJornada, idJugador, idEquipo,
            Minutos, Goles, Asistencias, TirosPenalti, TirosPenaltiIntentados,
            Disparos, DisparosPorteria, TarjetasAmarillas, TarjetasRojas, Toques,
            Entradas, Intercepciones, Bloqueos, GolesEsperados, GolesEsperadosSinPenaltis,
            AsistenciasEsperadas, AccionesCreadasDeTiro, AccionesCreadasDeGol, PasesCompletados,
            PasesIntentados, PorcentajePasesCompletados, PasesProgresivos, Controles,
            ConduccionesProgresivas, EntradasOfensivas, EntradasConExito,
            params.id
        ]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la estadística para actualizar" }, { status: 404 });
        }

        console.log("Estadística actualizada:", result);
        return NextResponse.json({ message: "Estadística actualizada exitosamente", result });
    } catch (error) {
        console.error("Error actualizando estadística:", error);
        return NextResponse.json({ message: "Error actualizando estadística", error }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const result = await db.query("DELETE FROM mydb.estadisticas WHERE idEstadisticas = ?", [params.id]) as any;

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: "No se encontró la estadística para eliminar" }, { status: 404 });
        }

        console.log("Estadística eliminada:", result);
        return NextResponse.json({ message: "Estadística eliminada exitosamente", result });
    } catch (error) {
        console.error("Error eliminando estadística:", error);
        return NextResponse.json({ message: "Error eliminando estadística", error }, { status: 500 });
    }
}
