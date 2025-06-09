// app/api/cartas-manager/objetos/route.ts
import { db } from "@/lib/mysql"; // Asegúrate de que esta ruta sea correcta
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

    console.log(`INFO: Obteniendo cartas de objeto para Manager ID: ${managerIdNum}`);

    // ¡¡¡CONSULTA CORRECTA PARA OBTENER CARTAS DE OBJETO DEL MANAGER!!!
    // Basado en las tablas cartaobjeto y objetos que proporcionaste
    const [rows]: any = await db.query(
      `SELECT
          co.idCartaObjeto,
          co.Rareza,
          o.idObjetos AS Objeto_idObjetoDB,
          o.Nombre AS NombreObjeto,
          o.Descripcion AS DescripcionObjeto,
          o.Precio AS PrecioObjeto
       FROM CartaObjeto co
       JOIN Objetos o ON co.idObjetos = o.idObjetos
       WHERE co.idManager = ?`, // Asumo que idManager es la columna que relaciona cartaobjeto con el manager
      [managerIdNum]
    );

    // MySQL2 devuelve los resultados en rows[0] si es una query de selección
    const cartasObjeto = Array.isArray(rows[0]) ? rows[0] : rows;

    console.log(`INFO: Se encontraron ${cartasObjeto.length} cartas de objeto para el manager ${managerIdNum}`);
    console.log("DEBUG: Cartas de objeto obtenidas:", cartasObjeto);

    return NextResponse.json({ cartasObjeto }, { status: 200 });

  } catch (error: any) {
    console.error("❌ CRITICAL ERROR: Fallo al obtener cartas de objeto del manager:", error);
    if (error.code) console.error("SQL Error Code:", error.code);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener objetos del manager", details: error.message },
      { status: 500 }
    );
  }
}