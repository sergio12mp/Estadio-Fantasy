import { NextRequest, NextResponse } from "next/server";
import {
  GetManagerEconomy,
  UpdateManagerEconomy,
} from "@/database/manager";
export const currencyMap = new Map<number, { oro: number; balones: number }>();
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("managerId"));
  if (!id) {
    return NextResponse.json({ error: "managerId requerido" }, { status: 400 });
  }

  try {
    const economy = await GetManagerEconomy(id);
    if (!economy) {
      return NextResponse.json(
        { error: "Manager no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(economy);
  } catch (err: any) {
    console.error("Error obteniendo economia", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { managerId, deltaOro = 0, deltaBalones = 0 } = await req.json();
  if (!managerId) {
    return NextResponse.json({ error: "managerId requerido" }, { status: 400 });
  }

  try {
    const current = (await GetManagerEconomy(managerId)) || {
      oro: 0,
      balones: 0,
    };
    const newOro = current.oro + Number(deltaOro);
    const newBalones = current.balones + Number(deltaBalones);
    await UpdateManagerEconomy(managerId, newOro, newBalones);
    return NextResponse.json({ oro: newOro, balones: newBalones });
  } catch (err: any) {
    console.error("Error actualizando economia", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
