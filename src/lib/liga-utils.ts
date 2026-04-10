// src/lib/ligas-utils.ts

import { db } from "@/lib/mysql";
import { queryOne } from "@/lib/db-utils";

/**
 * Asigna un manager a la liga general si aún no es miembro.
 * @param idManager El ID del manager a asignar.
 */
export async function joinGeneralLeague(idManager: number) {
    try {
        // console.log(`INFO: Intentando asignar manager con ID ${idManager} a la liga general.`);

        let ligaGeneral = await queryOne<{ idLigas: number }>("SELECT idLigas FROM Ligas WHERE tipo = 'general'");
        let ligaGeneralId: number;

        if (!ligaGeneral) {
            // console.log("INFO: No existe liga general. Creándola automáticamente.");
            const [insertResult]: any = await db.query(
                "INSERT INTO Ligas (Nombre, Codigo, tipo) VALUES ('Liga General', NULL, 'general')"
            );
            ligaGeneralId = insertResult.insertId;
            // console.log(`INFO: Liga general creada con ID: ${ligaGeneralId}`);
        } else {
            ligaGeneralId = ligaGeneral.idLigas;
        }

        const inLiga = await queryOne(
            "SELECT 1 FROM Manager_Ligas WHERE Manager_idManager = ? AND Ligas_idLigas = ?",
            [idManager, ligaGeneralId]
        );

        if (!inLiga) {
            await db.query(
                "INSERT INTO Manager_Ligas (Manager_idManager, Ligas_idLigas) VALUES (?, ?)",
                [idManager, ligaGeneralId]
            );
            // console.log(`INFO: Manager con ID ${idManager} añadido exitosamente a la liga general.`);
        }
        // else: console.log(`INFO: Manager con ID ${idManager} ya es miembro de la liga general.`);

    } catch (error) {
        console.error("❌ CRITICAL ERROR: Fallo al asignar manager a la liga general:", error);
        throw error;
    }
}
