// app/api/jornada/last/route.ts
import { db } from "@/lib/mysql"; // Asegúrate de que esta ruta sea correcta
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [jornadaQueryResult]: any = await db.query(
      `SELECT idJornada FROM Jornada ORDER BY idJornada DESC LIMIT 1`
    );

    const lastJornada = Array.isArray(jornadaQueryResult[0])
      ? jornadaQueryResult[0][0]
      : jornadaQueryResult[0];

    if (!lastJornada) {
      console.warn("WARN: No se encontró ninguna jornada en la base de datos.");
      return NextResponse.json({ error: "No se encontró ninguna jornada" }, { status: 404 });
    }

    console.log(`INFO: Última idJornada encontrada: ${lastJornada.idJornada}`);
    return NextResponse.json({ idJornada: lastJornada.idJornada }, { status: 200 });

  } catch (error: any) {
    console.error("❌ CRITICAL ERROR: Fallo al obtener la última jornada:", error);
    return NextResponse.json({ error: "Error interno del servidor al obtener la jornada" }, { status: 500 });
  }
}