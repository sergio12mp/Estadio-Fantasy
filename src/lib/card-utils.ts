// lib/card-utils.ts
import { db } from "@/lib/mysql"; // Asegúrate de que esta ruta sea correcta para tu conexión a la DB

/**
 * Rellena todas las cartas comunes para un manager específico.
 * @param managerId El ID del manager para el cual se generarán las cartas.
 * @returns El número de cartas comunes creadas.
 */
export async function fillCommonCardsForManager(managerId: number): Promise<number> {
  console.log(`INFO: Iniciando llenado de cartas comunes para el manager ID: ${managerId}`);

  // 1. Obtener todos los jugadores existentes
  // Nos aseguramos de extraer siempre el array de filas de forma robusta,
  // ya que db.query puede devolver [filas, metadatos] o solo filas.
  const playersQueryResult: any = await db.query('SELECT idJugador FROM Jugador');
  const players: any[] = Array.isArray(playersQueryResult[0]) ? playersQueryResult[0] : playersQueryResult;

  console.log(`DEBUG: Jugadores obtenidos para llenado de cartas comunes:`, players);

  if (!Array.isArray(players) || players.length === 0) {
    console.log("INFO: No hay jugadores en la base de datos para crear cartas comunes. Proceso finalizado para este manager.");
    return 0; // No se crearon cartas
  }

  let cardsCreatedCount = 0;
  const batchSize = 1000; // Define el tamaño del lote para inserciones SQL
  const valuesToInsert: string[] = [];

  // Iterar sobre cada jugador para este manager
  for (const player of players) {
    const idJugador = player.idJugador;

    // Para un manager NUEVO, asumimos que no tiene cartas comunes aún,
    // por lo que no es necesario verificar la existencia de cada carta individualmente con un SELECT.
    // Esto optimiza el proceso.
    
    // IMPORTANTE: Asegúrate de que los nombres de las columnas coincidan con tu DB: Manager_idManager, Jugador_idJugador
    valuesToInsert.push(`(${managerId}, ${idJugador}, 'Comun')`);
    cardsCreatedCount++;
  }

  // Insertar cartas comunes en lotes
  if (valuesToInsert.length > 0) {
    for (let i = 0; i < valuesToInsert.length; i += batchSize) {
      const batch = valuesToInsert.slice(i, i + batchSize);
      // IMPORTANTE: Asegúrate de que los nombres de las columnas coincidan con tu DB: Manager_idManager, Jugador_idJugador
      const insertQuery = `INSERT INTO CartaJugador (Manager_idManager, Jugador_idJugador, rareza) VALUES ${batch.join(',')}`;

      try {
        console.log(`DEBUG: Ejecutando INSERT lote (${batch.length} cartas comunes para manager ${managerId}).`);
        await db.query(insertQuery);
        console.log(`INFO: Lote de ${batch.length} cartas comunes insertadas para manager ${managerId}.`);
      } catch (insertError: any) {
        // Manejar errores de inserción, especialmente si hay entradas duplicadas
        // (aunque no debería pasar para un manager nuevo sin cartas previas).
        if (insertError.code === 'ER_DUP_ENTRY') {
          console.warn(`WARN: Duplicado al insertar lote para manager ${managerId}.`);
        } else {
          console.error(`ERROR: Fallo al insertar lote de cartas comunes para manager ${managerId}:`, insertError);
          throw insertError; // Propagar otros errores críticos
        }
      }
    }
  } else {
    console.log(`INFO: No se encontraron jugadores para crear cartas comunes para el manager ${managerId}.`);
  }

  console.log(`INFO: Llenado de cartas comunes completado para manager ${managerId}. Total creadas: ${cardsCreatedCount}`);
  return cardsCreatedCount;
}