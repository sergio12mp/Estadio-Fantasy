import { NextRequest, NextResponse } from 'next/server';

const currencyMap = new Map<number, { oro: number; balones: number }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('managerId'));
  if (!id) {
    return NextResponse.json({ error: 'managerId requerido' }, { status: 400 });
  }
  const entry = currencyMap.get(id) ?? { oro: 0, balones: 0 };
  currencyMap.set(id, entry);
  return NextResponse.json(entry);
}

export async function POST(req: NextRequest) {
  const { managerId, deltaOro = 0, deltaBalones = 0 } = await req.json();
  if (!managerId) {
    return NextResponse.json({ error: 'managerId requerido' }, { status: 400 });
  }
  const entry = currencyMap.get(managerId) ?? { oro: 0, balones: 0 };
  entry.oro += Number(deltaOro);
  entry.balones += Number(deltaBalones);
  currencyMap.set(managerId, entry);
  return NextResponse.json(entry);
}
