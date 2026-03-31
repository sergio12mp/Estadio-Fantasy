// src/lib/ligas-utils.ts

import { db } from "@/lib/mysql";

/**
 * Asigna un manager a la liga general si aún no es miembro.
 * @param idManager El ID del manager a asignar.
 */
export async function joinGeneralLeague(idManager: number) {
    try {
        console.log(`INFO: Intentando asignar manager con ID ${idManager} a la liga general.`);

        // 1. Obtener (o crear) la liga general
        const [ligaGeneralQueryResult]: any = await db.query("SELECT idLigas FROM Ligas WHERE tipo = 'general'");
        let ligaGeneralId: number | null =
            Array.isArray(ligaGeneralQueryResult) && ligaGeneralQueryResult.length > 0
                ? ligaGeneralQueryResult[0].idLigas
                : null;

        if (!ligaGeneralId) {
            console.log("INFO: No existe liga general. Creándola automáticamente.");
            const [insertResult]: any = await db.query(
                "INSERT INTO Ligas (Nombre, Codigo, tipo) VALUES ('Liga General', NULL, 'general')"
            );
            ligaGeneralId = insertResult.insertId;
            console.log(`INFO: Liga general creada con ID: ${ligaGeneralId}`);
        }

        // 2. Verificar si el manager ya está en la liga general
        const [managerInLigaQueryResult]: any = await db.query(
            "SELECT * FROM Manager_Ligas WHERE Manager_idManager = ? AND Ligas_idLigas = ?",
            [idManager, ligaGeneralId]
        );

        const managerInLiga = Array.isArray(managerInLigaQueryResult) && managerInLigaQueryResult.length > 0;

        if (!managerInLiga) {
            // 3. Si no está, lo insertamos
            await db.query(
                "INSERT INTO Manager_Ligas (Manager_idManager, Ligas_idLigas) VALUES (?, ?)",
                [idManager, ligaGeneralId]
            );
            console.log(`INFO: Manager con ID ${idManager} añadido exitosamente a la liga general.`);
        } else {
            console.log(`INFO: Manager con ID ${idManager} ya es miembro de la liga general.`);
        }

    } catch (error) {
        console.error("❌ CRITICAL ERROR: Fallo al asignar manager a la liga general:", error);
        throw error;
    }
}