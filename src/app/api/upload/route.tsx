// Este endpoint está obsoleto — usar /api/procesarCSV en su lugar
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Endpoint obsoleto. Usa /api/procesarCSV con multipart/form-data.' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { message: 'Endpoint obsoleto. Usa /api/procesarCSV.' },
    { status: 410 }
  );
}
