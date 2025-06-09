import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

// GET /api/manager/economia/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idManager = parseInt(params.id);
    if (isNaN(idManager)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const [rows]: [any[], any] = await db.query(
      "SELECT oro, balones FROM Manager WHERE idManager = ?",
      [idManager]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Manager no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ oro: rows[0].oro, balones: rows[0].balones });
  } catch (error: any) {
    console.error("Error obteniendo economía del manager:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/manager/economia/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idManager = parseInt(params.id);
    const { oro, balones } = await req.json();
    if (isNaN(idManager) || oro === undefined || balones === undefined) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const [result]: [any, any] = await db.query(
      "UPDATE Manager SET oro = ?, balones = ? WHERE idManager = ?",
      [oro, balones, idManager]
    );
    return NextResponse.json({ updated: (result as any).affectedRows > 0 });
  } catch (error: any) {
    console.error("Error actualizando economía del manager:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
