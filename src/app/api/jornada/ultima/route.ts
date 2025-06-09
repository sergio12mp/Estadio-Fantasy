// app/api/jornada/ultima/route.ts
import { db } from "@/lib/mysql"; // Asegúrate de que esta ruta sea correcta
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("INFO: Intentando obtener la última jornada.");
    const [rows]: any = await db.query(
      `SELECT idJornada FROM Jornada ORDER BY idJornada DESC LIMIT 1`
    );
    console.log("DEBUG: Resultado de la consulta a la base de datos:", rows);
    // MySQL2 devuelve los resultados en rows[0] si es una query de selección
    //const lastJornada = Array.isArray(rows[0]) && rows[0].length > 0 ? rows[0][0] : null;
    const lastJornada = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!lastJornada || !lastJornada.idJornada) { // También verifica que idJornada exista en el objeto
      console.warn("WARN: No se encontró ninguna jornada en la base de datos.");
      return NextResponse.json({ error: "No se encontró ninguna jornada." }, { status: 404 });
    }

    console.log("INFO: Última jornada obtenida:", lastJornada.idJornada);
    return NextResponse.json({ idJornada: lastJornada.idJornada }, { status: 200 });
  } catch (error: any) {
    console.error("❌ CRITICAL ERROR: Error al obtener la última jornada:", error);
    if (error.code) console.error("SQL Error Code:", error.code);
    return NextResponse.json({ error: "Error interno del servidor al obtener la última jornada", details: error.message }, { status: 500 });
  }
}