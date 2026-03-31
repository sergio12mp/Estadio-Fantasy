import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

// GET /api/manager/[id] → busca por idManager (número)
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idManager = Number(params.id);
    if (isNaN(idManager)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [rows] = await db.query(
      "SELECT * FROM Manager WHERE idManager = ?",
      [idManager]
    ) as [any[], any];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Manager no encontrado" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error("❌ Error en GET /api/manager/[id]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/manager/[id] → actualiza nombre del manager por idManager
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idManager = Number(params.id);
    if (isNaN(idManager)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { nombre } = await req.json();
    if (!nombre) {
      return NextResponse.json({ error: "Falta el campo nombre" }, { status: 400 });
    }

    const result: any = await db.query(
      "UPDATE Manager SET Nombre = ? WHERE idManager = ?",
      [nombre, idManager]
    );

    const affectedRows = result[0]?.affectedRows ?? 0;
    return NextResponse.json({ updated: true, affectedRows });
  } catch (error: any) {
    console.error("❌ Error en PUT /api/manager/[id]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
