// src/app/api/ligas/crear/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql"; // Asegúrate de que la ruta a tu conexión de DB sea correcta
import { v4 as uuidv4 } from 'uuid';
import { Connection } from "mysql2/promise";

export async function POST(req: NextRequest) {
    let connection: Connection | null = null;
    try {
        const { nombreLiga, managerId } = await req.json();

        // 1. Validar los datos de entrada
        if (!nombreLiga || !managerId) {
            return NextResponse.json({ message: "Nombre de liga y managerId son requeridos" }, { status: 400 });
        }
        
        const managerIdNum = parseInt(managerId);
        if (isNaN(managerIdNum)) {
            return NextResponse.json({ message: "managerId no es un número válido" }, { status: 400 });
        }

        // 2. Obtener una conexión del pool y empezar la transacción
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 3. Generar un código único para unirse a la liga
        const codigo = uuidv4();
        console.log(`INFO: Creando liga "${nombreLiga}" con código de unión: ${codigo}`);

        // 4. Insertar la nueva liga
        const insertLigaQuery = `
            INSERT INTO Ligas (Nombre, Codigo, tipo)
            VALUES (?, ?, 'privada');
        `;
        const [insertLigaResult]: any = await connection.query(insertLigaQuery, [nombreLiga, codigo]);
        const newLigaId = insertLigaResult.insertId;

        // 5. Asociar el manager (creador) a la nueva liga
        const insertManagerLigaQuery = `
            INSERT INTO Manager_Ligas (Manager_idManager, Ligas_idLigas)
            VALUES (?, ?);
        `;
        await connection.query(insertManagerLigaQuery, [managerIdNum, newLigaId]);

        // 6. Confirmar la transacción
        await connection.commit();

        console.log(`INFO: Liga "${nombreLiga}" creada con éxito por el manager ID: ${managerIdNum}`);

        return NextResponse.json({ 
            message: "Liga creada con éxito", 
            liga: { 
                idLigas: newLigaId, 
                nombre: nombreLiga, 
                codigoUnirse: codigo 
            }
        }, { status: 201 });

    } catch (error: any) {
        // En caso de error, revertir la transacción si existe una conexión
        if (connection) {
            await connection.rollback();
        }
        console.error("ERROR CRÍTICO: Fallo en el endpoint de creación de liga:", error);
        return NextResponse.json(
            { message: "Error interno del servidor", error: error.message },
            { status: 500 }
        );
    } finally {
        // Asegurarse de liberar la conexión de vuelta al pool
        if (connection) {
            connection.release();
        }
    }
}