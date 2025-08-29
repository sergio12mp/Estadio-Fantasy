// src/app/api/ligas/unirse/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import { Connection } from "mysql2/promise";

export async function POST(req: NextRequest) {
    let connection: Connection | null = null;
    try {
        const { codigo, managerId } = await req.json();

        // 1. Validar los datos de entrada
        if (!codigo || !managerId) {
            return NextResponse.json({ message: "Código de liga y managerId son requeridos" }, { status: 400 });
        }
        
        const managerIdNum = parseInt(managerId);
        if (isNaN(managerIdNum)) {
            return NextResponse.json({ message: "managerId no es un número válido" }, { status: 400 });
        }

        // 2. Obtener una conexión y buscar la liga por código
        connection = await db.getConnection();
        const [ligas]: any = await connection.query(
            "SELECT idLigas FROM Ligas WHERE Codigo = ?",
            [codigo]
        );

        if (ligas.length === 0) {
            return NextResponse.json({ message: "No se encontró ninguna liga con ese código." }, { status: 404 });
        }

        const ligaId = ligas[0].idLigas;

        // 3. Verificar si el manager ya está en la liga
        const [miembros]: any = await connection.query(
            "SELECT * FROM Manager_Ligas WHERE Manager_idManager = ? AND Ligas_idLigas = ?",
            [managerIdNum, ligaId]
        );

        if (miembros.length > 0) {
            return NextResponse.json({ message: "Ya eres miembro de esta liga." }, { status: 409 });
        }

        // 4. Iniciar transacción y asociar el manager a la liga
        await connection.beginTransaction();
        const insertQuery = `
            INSERT INTO Manager_Ligas (Manager_idManager, Ligas_idLigas)
            VALUES (?, ?);
        `;
        await connection.query(insertQuery, [managerIdNum, ligaId]);
        await connection.commit();

        console.log(`INFO: Manager con ID ${managerIdNum} se ha unido a la liga con ID ${ligaId}.`);

        return NextResponse.json({ 
            message: "Te has unido a la liga con éxito.",
            ligaId: ligaId
        }, { status: 200 });

    } catch (error: any) {
        if (connection) {
            await connection.rollback();
        }
        console.error("ERROR CRÍTICO: Fallo en el endpoint de unirse a liga:", error);
        return NextResponse.json(
            { message: "Error interno del servidor", error: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}