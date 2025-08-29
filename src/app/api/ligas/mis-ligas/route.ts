// src/app/api/ligas/mis-ligas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const managerId = searchParams.get('managerId');

        if (!managerId) {
            return NextResponse.json({ message: 'El ID del manager es requerido' }, { status: 400 });
        }

        const managerIdNum = parseInt(managerId);
        if (isNaN(managerIdNum)) {
            return NextResponse.json({ message: "managerId no es un número válido" }, { status: 400 });
        }

        const query = `
            SELECT L.idLigas, L.Nombre, L.Codigo
            FROM Ligas AS L
            JOIN Manager_Ligas AS ML ON L.idLigas = ML.Ligas_idLigas
            WHERE ML.Manager_idManager = ?;
        `;
        
        const [ligas] = await db.query(query, [managerIdNum]);

        return NextResponse.json({ ligas: ligas }, { status: 200 });

    } catch (error: any) {
        console.error("ERROR: Fallo al obtener las ligas del manager:", error);
        return NextResponse.json(
            { message: "Error interno del servidor", error: error.message },
            { status: 500 }
        );
    }
}