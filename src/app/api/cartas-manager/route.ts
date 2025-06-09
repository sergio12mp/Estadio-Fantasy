// app/api/cartas-manager/route.ts
import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json({ error: "Falta el parámetro managerId" }, { status: 400 });
    }

    const managerIdNum = parseInt(managerId as string);
    if (isNaN(managerIdNum)) {
      return NextResponse.json({ error: "managerId no es un número válido" }, { status: 400 });
    }

    console.log(`INFO: Obteniendo cartas de jugador para Manager ID: ${managerIdNum}`);

    const [cartasJugadorQueryResult]: any = await db.query(
      `SELECT
          cj.idCartaJugador,
          cj.Rareza,
          j.idJugador AS Jugador_idJugadorDB,
          j.Nombre AS NombreJugador,
          j.Posicion AS PosicionJugadorDB,
          j.Edad,
          j.Pais,
          j.Precio,
          j.Puntos, -- <--- ¡Asegúrate de incluir j.Puntos aquí!
          e.Nombre AS NombreEquipo
       FROM CartaJugador cj
       JOIN Jugador j ON cj.Jugador_idJugador = j.idJugador
       JOIN Equipo e ON j.idEquipo = e.idEquipo
       WHERE cj.Manager_idManager = ?`,
      [managerIdNum]
    );

    const cartasJugador = Array.isArray(cartasJugadorQueryResult[0])
                          ? cartasJugadorQueryResult[0]
                          : cartasJugadorQueryResult;

    console.log(`INFO: Encontradas ${cartasJugador.length} cartas de jugador para Manager ID: ${managerIdNum}`);
    return NextResponse.json({ cartasJugador }, { status: 200 });

  } catch (error: any) {
    console.error("❌ CRITICAL ERROR: Fallo al obtener cartas de jugador del manager:", error);
    if (error.code) console.error("SQL Error Code:", error.code);
    if (error.sqlMessage) console.error("SQL Error Message:", error.sqlMessage);
    return NextResponse.json({ error: "Error interno del servidor al cargar cartas de jugador del manager." }, { status: 500 });
  }
}