// app/api/fill-common-cards/route.ts

import { db } from "@/lib/mysql";
import { queryRows } from "@/lib/db-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // console.log("INFO: Iniciando el proceso de llenado de cartas comunes.");

    const managers = await queryRows<{ idManager: number }>('SELECT idManager FROM Manager');
    // console.log(`INFO: Encontrados ${managers.length} managers.`);

    const players = await queryRows<{ idJugador: number }>('SELECT idJugador FROM Jugador');
    // console.log(`INFO: Encontrados ${players.length} jugadores.`);

    if (managers.length === 0 || players.length === 0) {
      // console.log("INFO: No hay managers o jugadores válidos para procesar. Proceso finalizado.");
      return NextResponse.json({ message: "No hay managers o jugadores válidos para procesar." }, { status: 200 });
    }

    let cardsCreatedCount = 0;
    const batchSize = 1000;

    for (const manager of managers) {
      const idManager = manager.idManager;
      // console.log(`DEBUG: Procesando manager ID: ${idManager}`);

      const valuesToInsert: string[] = [];

      for (const player of players) {
        const idJugador = player.idJugador;

        const existing = await queryRows(
          'SELECT idCartaJugador FROM CartaJugador WHERE Manager_idManager = ? AND Jugador_idJugador = ? AND rareza = ?',
          [idManager, idJugador, 'Comun']
        );

        if (existing.length === 0) {
          // console.log(`INFO: Carta Comun NO existe. Añadiendo a lote: Manager: ${idManager}, Jugador: ${idJugador}`);
          valuesToInsert.push(`(${idManager}, ${idJugador}, 'Comun')`);
          cardsCreatedCount++;
        }
      }

      if (valuesToInsert.length > 0) {
        // console.log(`INFO: Preparando inserción de ${valuesToInsert.length} cartas para manager ${idManager}.`);
        for (let i = 0; i < valuesToInsert.length; i += batchSize) {
          const batch = valuesToInsert.slice(i, i + batchSize);
          const insertQuery = `INSERT INTO CartaJugador (Manager_idManager, Jugador_idJugador, rareza) VALUES ${batch.join(',')}`;

          try {
            await db.query(insertQuery);
            // console.log(`INFO: Lote de ${batch.length} cartas comunes insertadas para manager ${idManager}.`);
          } catch (insertError: any) {
            if (insertError.code === 'ER_DUP_ENTRY') {
              console.warn(`WARN: Duplicado detectado al insertar lote para manager ${idManager}.`);
            } else {
              console.error(`ERROR CRITICO: Fallo al insertar lote de cartas comunes para manager ${idManager}:`, insertError);
              throw insertError;
            }
          }
        }
      }
    }

    // console.log(`INFO: Proceso de llenado de cartas comunes completado. Total de cartas creadas: ${cardsCreatedCount}`);
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
