// src/app/api/cartas-manager/objetos/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get('managerId');
    console.log('✅ GET request received for managerId:', managerId);

    if (!managerId) {
      console.error('❌ Error: managerId is null or undefined.');
      return NextResponse.json({ error: 'Manager ID is required' }, { status: 400 });
    }

    const query = `
      SELECT 
        idCartaObjeto, 
        idObjetos,
        Rareza
      FROM cartaobjeto
      WHERE idManager = ?;
    `;
    
    console.log('🔍 Executing query:', query, 'with managerId:', managerId);

    const [rows] = await db.query<RowDataPacket[]>(query, [managerId]);
    console.log('📊 Query result (rows):', rows);

    const cartasObjeto = rows.map(row => ({
      idCartaObjeto: row.idCartaObjeto,
      idObjetos: row.idObjetos,
      Rareza: row.Rareza,
      NombreObjeto: `Objeto ${row.idObjetos}`,
    }));

    console.log('📦 Processed data to send to frontend:', cartasObjeto);

    return NextResponse.json({ cartasObjeto }, { status: 200 });

  } catch (error) {
    console.error('❌ ERROR fetching manager item cards:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}