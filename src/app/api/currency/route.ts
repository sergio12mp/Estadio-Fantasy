import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db-utils";
import { db } from "@/lib/mysql";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("managerId"));
  if (!id) {
    return NextResponse.json({ error: "managerId requerido" }, { status: 400 });
  }

  try {
    const economy = await queryOne<{ oro: number; balones: number }>(
      "SELECT oro, balones FROM Manager WHERE idManager = ?",
      [id]
    );
    if (!economy) {
      return NextResponse.json({ error: "Manager no encontrado" }, { status: 404 });
    }
    return NextResponse.json(economy);
  } catch (err: any) {
    console.error("Error obteniendo economia", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { managerId, deltaOro = 0, deltaBalones = 0 } = await req.json();
  if (!managerId) {
    return NextResponse.json({ error: "managerId requerido" }, { status: 400 });
  }

  try {
    const current = (await queryOne<{ oro: number; balones: number }>(
      "SELECT oro, balones FROM Manager WHERE idManager = ?",
      [managerId]
    )) ?? { oro: 0, balones: 0 };

    const newOro = current.oro + Number(deltaOro);
    const newBalones = current.balones + Number(deltaBalones);
    await db.query("UPDATE Manager SET oro = ?, balones = ? WHERE idManager = ?", [newOro, newBalones, managerId]);
    return NextResponse.json({ oro: newOro, balones: newBalones });
  } catch (err: any) {
    console.error("Error actualizando economia", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
