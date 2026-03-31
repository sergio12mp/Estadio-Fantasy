import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";

export async function POST(req: NextRequest) {
  const { deltaOro = 0, deltaBalones = 0 } = await req.json();

  if (deltaOro === 0 && deltaBalones === 0) {
    return NextResponse.json({ error: "Debes indicar al menos oro o balones" }, { status: 400 });
  }

  try {
    const [result]: any = await db.query(
      "UPDATE Manager SET oro = oro + ?, balones = balones + ?",
      [Number(deltaOro), Number(deltaBalones)]
    );
    return NextResponse.json({ affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Error distribuyendo monedas:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
