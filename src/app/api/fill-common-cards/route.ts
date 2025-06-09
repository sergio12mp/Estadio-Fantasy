// app/api/fill-common-cards/route.ts

import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("INFO: Iniciando el proceso de llenado de cartas comunes.");

    const managersQueryResult: any = await db.query('SELECT idManager FROM Manager');
    const managers = Array.isArray(managersQueryResult[0]) ? managersQueryResult[0] : managersQueryResult;
    console.log(`DEBUG: Managers obtenidos:`, managers);
    console.log(`INFO: Encontrados ${managers.length} managers.`);

    const playersQueryResult: any = await db.query('SELECT idJugador FROM Jugador');
    const players = Array.isArray(playersQueryResult[0]) ? playersQueryResult[0] : playersQueryResult;
    console.log(`DEBUG: Jugadores obtenidos:`, players);
    console.log(`INFO: Encontrados ${players.length} jugadores.`);

    if (!Array.isArray(managers) || managers.length === 0 || !Array.isArray(players) || players.length === 0) {
      console.log("INFO: No hay managers o jugadores válidos para procesar. Proceso finalizado.");
      return NextResponse.json({ message: "No hay managers o jugadores válidos para procesar." }, { status: 200 });
    }

    let cardsCreatedCount = 0;
    const batchSize = 1000;

    for (const manager of managers) {
      const idManager = manager.idManager;
      console.log(`DEBUG: Procesando manager ID: ${idManager}`);

      const valuesToInsert: string[] = [];

      for (const player of players) {
        const idJugador = player.idJugador;

        console.log(`DEBUG: Verificando carta Comun para Manager: ${idManager}, Jugador: ${idJugador}`);

        // *** CORRECCIÓN CLAVE AQUÍ: DESESTRUCTURACIÓN SEGURA ***
        const queryResult = await db.query(
          'SELECT idCartaJugador FROM CartaJugador WHERE Manager_idManager = ? AND Jugador_idJugador = ? AND rareza = ?',
          [idManager, idJugador, 'Comun']
        );
        const existingCardsRows = Array.isArray(queryResult[0]) ? queryResult[0] : queryResult;

        console.log(`DEBUG: Resultado de búsqueda de carta existente (${idManager}, ${idJugador}):`, existingCardsRows);

        if (Array.isArray(existingCardsRows) && existingCardsRows.length === 0) {
          console.log(`INFO: Carta Comun NO existe. Añadiendo a lote: Manager: ${idManager}, Jugador: ${idJugador}`);
          valuesToInsert.push(`(${idManager}, ${idJugador}, 'Comun')`);
          cardsCreatedCount++;
        } else {
          console.log(`INFO: Carta Comun YA existe. Saltando: Manager: ${idManager}, Jugador: ${idJugador}`);
        }
      }

      if (valuesToInsert.length > 0) {
        console.log(`INFO: Preparando inserción de ${valuesToInsert.length} cartas para manager ${idManager}.`);
        for (let i = 0; i < valuesToInsert.length; i += batchSize) {
          const batch = valuesToInsert.slice(i, i + batchSize);
          const insertQuery = `INSERT INTO CartaJugador (Manager_idManager, Jugador_idJugador, rareza) VALUES ${batch.join(',')}`;

          try {
            console.log(`DEBUG: Ejecutando INSERT lote (${batch.length} items):`, insertQuery.substring(0, 200) + '...');
            await db.query(insertQuery);
            console.log(`INFO: Lote de ${batch.length} cartas comunes insertadas para manager ${idManager}.`);
          } catch (insertError: any) {
            if (insertError.code === 'ER_DUP_ENTRY') {
              console.warn(`WARN: Duplicado detectado al insertar lote para manager ${idManager}.`);
            } else {
              console.error(`ERROR CRITICO: Fallo al insertar lote de cartas comunes para manager ${idManager}:`, insertError);
              throw insertError;
            }
          }
        }
      } else {
        console.log(`INFO: No se encontraron cartas comunes faltantes para el manager ${idManager}.`);
      }
    }

    console.log(`INFO: Proceso de llenado de cartas comunes completado. Total de cartas creadas: ${cardsCreatedCount}`);
    return NextResponse.json({
      message: "Proceso de llenado de cartas comunes completado.",
      cardsCreated: cardsCreatedCount
    }, { status: 200 });

  } catch (error: any) {
    console.error("❌ CRITICAL ERROR: Fallo global en el proceso de llenado de cartas comunes:", error);
    if (error.code) console.error("SQL Error Code:", error.code);
    if (error.sqlMessage) console.error("SQL Error Message:", error.sqlMessage);
    return NextResponse.json({ error: "Error interno del servidor al llenar cartas comunes." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    return NextResponse.json({ message: "Este endpoint es para POST para llenar cartas comunes." }, { status: 200 });
}
