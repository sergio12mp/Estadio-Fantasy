import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import { getSimulatedDate } from "@/lib/simulated-time";

// GET → devuelve la fecha simulada
export async function GET() {
  const fecha = await getSimulatedDate();
  return NextResponse.json({ fecha });
}

// POST → actualiza la fecha simulada
export async function POST(req: NextRequest) {
  try {
    const { fecha } = await req.json();

    if (!fecha) {
      return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });
    }

    await db.query(
      `REPLACE INTO Config (clave, valor) VALUES ('fecha_actual_simulada', ?)`,
      [fecha]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Error actualizando tiempo simulado:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
