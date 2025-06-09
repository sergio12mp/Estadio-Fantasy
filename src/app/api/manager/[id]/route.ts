import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

// GET /api/manager/[id] → busca por idGoogle
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idGoogle = params.id;

    const [rows]: [any[]] = await db.query("SELECT * FROM Manager WHERE idGoogle = ?", [idGoogle]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Manager no encontrado" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error("❌ Error en GET /api/manager/[id]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idGoogle = params.id;
    const { nombre, email, idGoogle: payloadIdGoogle } = await req.json();

    if (!nombre || !email || !payloadIdGoogle) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const result = await db.query(
      "UPDATE Manager SET nombre = ?, email = ?, idGoogle = ? WHERE idGoogle = ?",
      [nombre, email, payloadIdGoogle, idGoogle]
    );

    const affectedRows = (result as any)[0]?.affectedRows ?? 0;

    return NextResponse.json({ updated: true, affectedRows });
  } catch (error: any) {
    console.error("❌ Error en POST /api/manager/[id]:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
