// src/app/api/migracion/ligas-generales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

// Nota: No se requiere autenticación para este endpoint ya que es para una tarea administrativa
// que probablemente se ejecutará una sola vez.

export async function POST(req: NextRequest) {
    try {
        console.log("INFO: Iniciando proceso de migración: Añadir managers a la liga general.");

        // 1. Obtener el ID de la liga general
        const [ligaGeneralQueryResult]: any = await db.query(
            "SELECT idLigas FROM Ligas WHERE tipo = 'general'"
        );
        const ligaGeneralId = Array.isArray(ligaGeneralQueryResult) && ligaGeneralQueryResult.length > 0
            ? ligaGeneralQueryResult[0].idLigas
            : null;

        if (!ligaGeneralId) {
            console.error("ERROR: No se encontró una liga de tipo 'general'. Proceso abortado.");
            return NextResponse.json(
                { message: "Error: No se encontró la liga general." },
                { status: 404 }
            );
        }

        // 2. Obtener todos los managers
        const managersQueryResult: any = await db.query('SELECT idManager FROM Manager');
        const managers = Array.isArray(managersQueryResult[0]) ? managersQueryResult[0] : managersQueryResult;

        if (managers.length === 0) {
            console.log("INFO: No hay managers en la base de datos. No se requiere migración.");
            return NextResponse.json(
                { message: "No hay managers para migrar." },
                { status: 200 }
            );
        }

        let managersAddedCount = 0;
        let managersExistingCount = 0;
        const batchInsert: string[] = [];

        for (const manager of managers) {
            const idManager = manager.idManager;

            // 3. Verificar si el manager ya está en la liga general
            const [managerInLigaQueryResult]: any = await db.query(
                "SELECT 1 FROM Manager_Ligas WHERE Manager_idManager = ? AND Ligas_idLigas = ?",
                [idManager, ligaGeneralId]
            );

            const isManagerInLiga = Array.isArray(managerInLigaQueryResult) && managerInLigaQueryResult.length > 0;

            if (!isManagerInLiga) {
                // Si no está, lo añadimos al lote de inserción
                batchInsert.push(`(${db.escape(idManager)}, ${db.escape(ligaGeneralId)})`);
                managersAddedCount++;
            } else {
                managersExistingCount++;
            }
        }
        
        // 4. Insertar en lote si hay managers nuevos
        if (batchInsert.length > 0) {
            const insertQuery = `INSERT INTO Manager_Ligas (Manager_idManager, Ligas_idLigas) VALUES ${batchInsert.join(',')}`;
            await db.query(insertQuery);
            console.log(`INFO: Se han añadido ${managersAddedCount} managers nuevos a la liga general.`);
        }

        console.log("INFO: Proceso de migración completado.");
        return NextResponse.json({
            message: "Proceso de migración completado.",
            managersAdded: managersAddedCount,
            managersAlreadyInLeague: managersExistingCount,
        }, { status: 200 });

    } catch (error: any) {
        console.error("ERROR CRÍTICO: Fallo en el endpoint de migración:", error);
        return NextResponse.json(
            { message: "Error interno del servidor", error: error.message },
            { status: 500 }
        );
    }
}

// Puedes añadir una ruta GET para fines informativos, si lo deseas
export async function GET() {
    return NextResponse.json(
        { message: "Este endpoint es para el método POST, para migrar managers a la liga general." },
        { status: 200 }
    );
}