// src/app/api/ligas/[id]/clasificacion/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

// Define el tipo de dato que esperamos de la clasificación, basado en tu esquema.
type Clasificacion = {
    idManager: number;
    nombreManager: string;
    puntuacion_actual: number;
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const ligaId = params.id;

        // 1. Validar el ID de la liga
        if (!ligaId || isNaN(parseInt(ligaId))) {
            return NextResponse.json({ message: "ID de liga no válido" }, { status: 400 });
        }
        
        const ligaIdNum = parseInt(ligaId);
        
        console.log(`INFO: Obteniendo clasificación para la liga ID: ${ligaIdNum}`);

        // 2. Obtener info de la liga (tipo, equipo) junto con la clasificación
        const [ligaInfo]: any = await db.query(
            `SELECT L.tipo, L.idEquipo, E.Nombre AS NombreEquipo
             FROM Ligas AS L
             LEFT JOIN Equipo AS E ON L.idEquipo = E.idEquipo
             WHERE L.idLigas = ?`,
            [ligaIdNum]
        );

        if (!ligaInfo || (Array.isArray(ligaInfo) && ligaInfo.length === 0)) {
            return NextResponse.json({ message: "Liga no encontrada", clasificacion: [] }, { status: 404 });
        }

        const liga = Array.isArray(ligaInfo) ? ligaInfo[0] : ligaInfo;

        // 3. Consulta de la base de datos para la clasificación
        const query = `
            SELECT
                m.idManager,
                m.nombre AS nombreManager,
                ml.puntuacion_actual
            FROM Manager m
            JOIN Manager_Ligas ml ON m.idManager = ml.Manager_idManager
            WHERE ml.Ligas_idLigas = ?
            ORDER BY ml.puntuacion_actual DESC;
        `;

        const [clasificacionQueryResult] = await db.query(query, [ligaIdNum]) as [Clasificacion[], any];
        const clasificacion = Array.isArray(clasificacionQueryResult) ? clasificacionQueryResult : [];

        if (clasificacion.length === 0) {
            console.log(`INFO: No se encontró clasificación para la liga ID: ${ligaIdNum}`);
            return NextResponse.json({ message: "No se encontró clasificación", clasificacion: [], liga }, { status: 200 });
        }

        console.log(`INFO: Clasificación encontrada para la liga ID: ${ligaIdNum}`);
        return NextResponse.json({ clasificacion, liga }, { status: 200 });

    } catch (error: any) {
        console.error(`Error en /api/ligas/${params.id}/clasificacion:`, error);
        return NextResponse.json({ message: "Error del servidor", error: error.message }, { status: 500 });
    }
}