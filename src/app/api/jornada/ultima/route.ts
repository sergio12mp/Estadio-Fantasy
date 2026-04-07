// app/api/jornada/ultima/route.ts
import { db } from "@/lib/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Leer la jornada actual desde Config
    const [configRows]: any = await db.query(
      "SELECT valor FROM Config WHERE clave = 'jornada_actual'"
    );

    let idJornada: number | null = configRows?.[0]?.valor
      ? parseInt(configRows[0].valor)
      : null;

    // Fallback: primera jornada con estadísticas si Config está vacía
    if (!idJornada) {
      const [primeras]: any = await db.query(
        "SELECT DISTINCT idJornada FROM Estadisticas ORDER BY idJornada ASC LIMIT 1"
      );
      if (!primeras?.length) {
        return NextResponse.json({ error: "No se encontró ninguna jornada." }, { status: 404 });
      }
      idJornada = primeras[0].idJornada;
      await db.query(
        "INSERT INTO Config (clave, valor) VALUES ('jornada_actual', ?) ON DUPLICATE KEY UPDATE valor = ?",
        [String(idJornada), String(idJornada)]
      );
    }

    return NextResponse.json({ idJornada }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error al obtener la última jornada:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
