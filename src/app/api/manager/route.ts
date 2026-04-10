// app/api/manager/route.ts
import { db } from "@/lib/mysql";
import { queryRows } from "@/lib/db-utils";
import { NextRequest, NextResponse } from "next/server";
import { fillCommonCardsForManager } from "@/lib/card-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idGoogle = searchParams.get("idGoogle");

    // Sin parámetros → devolver lista de todos los managers (para admin)
    if (!idGoogle) {
      const managers = await queryRows("SELECT idManager, Nombre, Email FROM Manager ORDER BY idManager");
      return NextResponse.json({ managers });
    }

    const managerRows = await queryRows("SELECT * FROM Manager WHERE idGoogle = ?", [idGoogle]);

    if (managerRows.length === 0) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    return NextResponse.json({ found: true, manager: managerRows[0] });
  } catch (error: any) {
    console.error("❌ Error en GET /api/manager:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, idGoogle } = await req.json();

    if (!name || !email || !idGoogle) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Paso 1: Verificar si el manager ya existe (para evitar duplicados al registrarse)
    const existingRows = await queryRows<{ idManager: number }>(
      "SELECT idManager FROM Manager WHERE idGoogle = ?",
      [idGoogle]
    );

    if (existingRows && existingRows.length > 0) {
      const existingManagerId = existingRows[0].idManager;
      // console.log(`INFO: Manager con idGoogle ${idGoogle} ya existe. ID: ${existingManagerId}.`);
      return NextResponse.json({ created: false, id: existingManagerId });
    }

    // Paso 2: Si el manager NO existe, insertarlo en la base de datos
    // console.log(`INFO: Creando nuevo manager para idGoogle: ${idGoogle}`);
    // Extracción robusta del resultado de la inserción (contiene insertId)
    const insertResult: any = await db.query(
      "INSERT INTO Manager (nombre, Email, idGoogle, oro, balones) VALUES (?, ?, ?, 0, 0)",
      [name, email, idGoogle]
    );

    // Obtener el ID del manager recién creado. Puede estar en insertResult.insertId o insertResult[0]?.insertId
    const newManagerId = insertResult.insertId ?? (insertResult[0]?.insertId); 

    if (!newManagerId) {
        console.error("ERROR: No se pudo obtener el ID del manager recién creado después de la inserción.");
        return NextResponse.json({ error: "Error al crear el manager, no se obtuvo el ID." }, { status: 500 });
    }

    // console.log(`INFO: Manager '${name}' (idGoogle: '${idGoogle}') creado exitosamente con ID: ${newManagerId}`);

    // Paso 3: ¡Llamar a la función para dar cartas comunes al nuevo manager!
    try {
      const cardsCreated = await fillCommonCardsForManager(newManagerId);
      // console.log(`INFO: Se crearon ${cardsCreated} cartas comunes para el nuevo manager ID: ${newManagerId}`);
    } catch (cardError: any) {
      console.error(`❌ ERROR: Fallo al crear cartas comunes para el manager ${newManagerId}:`, cardError);
      // Considera si quieres que este error impida la creación del manager
      // o si solo debe ser logueado (como está ahora).
      // Para este caso, el manager se crea aunque las cartas fallen, pero se loguea el error.
    }

    // Paso 4: Devolver la respuesta de éxito
    return NextResponse.json({
      created: true,
      id: newManagerId,
    });
  } catch (error: any) {
    console.error("❌ Error en POST /api/manager (catch global):", error);
    if (error.code) console.error("SQL Error Code:", error.code);
    if (error.sqlMessage) console.error("SQL Error Message:", error.sqlMessage);
    return NextResponse.json({ error: error.message || "Error interno del servidor." }, { status: 500 });
  }
}