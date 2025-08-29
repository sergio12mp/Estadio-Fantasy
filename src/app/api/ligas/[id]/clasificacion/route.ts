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

        // 2. Consulta de la base de datos para la clasificación
        // Esta consulta usa tu tabla Manager_Ligas y la columna puntuacion_actual
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
        
        const [clasificacionQueryResult]: [Clasificacion[], any] = await db.query(query, [ligaIdNum]);
        const clasificacion = Array.isArray(clasificacionQueryResult) ? clasificacionQueryResult : [];

        if (clasificacion.length === 0) {
            console.log(`INFO: No se encontró clasificación para la liga ID: ${ligaIdNum}`);
            return NextResponse.json({ message: "No se encontró clasificación", clasificacion: [] }, { status: 200 });
        }

        console.log(`INFO: Clasificación encontrada para la liga ID: ${ligaIdNum}`);
        return NextResponse.json({ clasificacion }, { status: 200 });

    } catch (error: any) {
        console.error(`Error en /api/ligas/${params.id}/clasificacion:`, error);
        return NextResponse.json({ message: "Error del servidor", error: error.message }, { status: 500 });
    }
}