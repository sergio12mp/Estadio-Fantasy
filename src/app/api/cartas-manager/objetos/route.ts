// src/app/api/cartas-manager/objetos/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
      return NextResponse.json({ error: 'Manager ID is required' }, { status: 400 });
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
         co.idCartaObjeto,
         co.idObjetos AS Objeto_idObjetoDB,
         o.Rareza,
         o.Nombre AS NombreObjeto,
         o.Descripcion AS DescripcionObjeto,
         o.Precio AS PrecioObjeto,
         o.Efecto AS EfectoObjeto,
         o.ValorEfecto,
         o.Estadistica AS EstadisticaObjeto
       FROM CartaObjeto co
       JOIN Objetos o ON co.idObjetos = o.idObjetos
       WHERE co.idManager = ?`,
      [managerId]
    );

    const cartasObjeto = rows.map(row => ({
      idCartaObjeto: row.idCartaObjeto,
      Objeto_idObjetoDB: row.Objeto_idObjetoDB,
      Rareza: row.Rareza,
      NombreObjeto: row.NombreObjeto,
      DescripcionObjeto: row.DescripcionObjeto,
      PrecioObjeto: row.PrecioObjeto,
      EfectoObjeto: row.EfectoObjeto,
      ValorEfecto: row.ValorEfecto ?? 1.0,
      EstadisticaObjeto: row.EstadisticaObjeto ?? null,
    }));

    return NextResponse.json({ cartasObjeto }, { status: 200 });

  } catch (error) {
    console.error('ERROR fetching manager item cards:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
