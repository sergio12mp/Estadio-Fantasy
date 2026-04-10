// src/app/api/ligas/[id]/clasificacion/route.ts

import { NextRequest, NextResponse } from "next/server";
import { queryOne, queryRows } from "@/lib/db-utils";

type Clasificacion = {
    idManager: number;
    nombreManager: string;
    puntuacion_actual: number;
    isBot: number;
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const ligaId = params.id;

        if (!ligaId || isNaN(parseInt(ligaId))) {
            return NextResponse.json({ message: "ID de liga no válido" }, { status: 400 });
        }

        const ligaIdNum = parseInt(ligaId);

        // console.log(`INFO: Obteniendo clasificación para la liga ID: ${ligaIdNum}`);

        const liga = await queryOne(
            `SELECT L.tipo, L.idEquipo, E.Nombre AS NombreEquipo
             FROM Ligas AS L
             LEFT JOIN Equipo AS E ON L.idEquipo = E.idEquipo
             WHERE L.idLigas = ?`,
            [ligaIdNum]
        );

        if (!liga) {
            return NextResponse.json({ message: "Liga no encontrada", clasificacion: [] }, { status: 404 });
        }

        const clasificacion = await queryRows<Clasificacion>(
            `SELECT
                m.idManager,
                m.nombre AS nombreManager,
                ml.puntuacion_actual,
                m.isBot
            FROM Manager m
            JOIN Manager_Ligas ml ON m.idManager = ml.Manager_idManager
            WHERE ml.Ligas_idLigas = ?
            ORDER BY ml.puntuacion_actual DESC`,
            [ligaIdNum]
        );

        if (clasificacion.length === 0) {
            // console.log(`INFO: No se encontró clasificación para la liga ID: ${ligaIdNum}`);
            return NextResponse.json({ message: "No se encontró clasificación", clasificacion: [], liga }, { status: 200 });
        }

        // console.log(`INFO: Clasificación encontrada para la liga ID: ${ligaIdNum}`);
        return NextResponse.json({ clasificacion, liga }, { status: 200 });

    } catch (error: any) {
        console.error(`Error en /api/ligas/${params.id}/clasificacion:`, error);
        return NextResponse.json({ message: "Error del servidor", error: error.message }, { status: 500 });
    }
}
