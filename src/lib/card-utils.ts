// lib/card-utils.ts
import { db } from "@/lib/mysql";
import { queryRows } from "@/lib/db-utils";

/**
 * Rellena todas las cartas comunes para un manager específico.
 * @param managerId El ID del manager para el cual se generarán las cartas.
 * @returns El número de cartas comunes creadas.
 */
export async function fillCommonCardsForManager(managerId: number): Promise<number> {
  // console.log(`INFO: Iniciando llenado de cartas comunes para el manager ID: ${managerId}`);

  const players = await queryRows<{ idJugador: number }>('SELECT idJugador FROM Jugador');

  if (players.length === 0) {
    // console.log("INFO: No hay jugadores en la base de datos para crear cartas comunes. Proceso finalizado para este manager.");
    return 0;
  }

  let cardsCreatedCount = 0;
  const batchSize = 1000;
  const valuesToInsert: string[] = [];

  for (const player of players) {
    // Para un manager NUEVO, asumimos que no tiene cartas comunes aún,
    // por lo que no es necesario verificar la existencia de cada carta individualmente con un SELECT.
    valuesToInsert.push(`(${managerId}, ${player.idJugador}, 'Comun')`);
    cardsCreatedCount++;
  }

  if (valuesToInsert.length > 0) {
    for (let i = 0; i < valuesToInsert.length; i += batchSize) {
      const batch = valuesToInsert.slice(i, i + batchSize);
      const insertQuery = `INSERT INTO CartaJugador (Manager_idManager, Jugador_idJugador, rareza) VALUES ${batch.join(',')}`;

      try {
        // console.log(`DEBUG: Ejecutando INSERT lote (${batch.length} cartas comunes para manager ${managerId}).`);
        await db.query(insertQuery);
        // console.log(`INFO: Lote de ${batch.length} cartas comunes insertadas para manager ${managerId}.`);
      } catch (insertError: any) {
        if (insertError.code === 'ER_DUP_ENTRY') {
          console.warn(`WARN: Duplicado al insertar lote para manager ${managerId}.`);
        } else {
          console.error(`ERROR: Fallo al insertar lote de cartas comunes para manager ${managerId}:`, insertError);
          throw insertError;
        }
      }
    }
  }

  // console.log(`INFO: Llenado de cartas comunes completado para manager ${managerId}. Total creadas: ${cardsCreatedCount}`);
  return cardsCreatedCount;
}
