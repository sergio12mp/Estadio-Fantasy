// GET  /api/admin/config          → devuelve todas las claves de configuración editables
// PATCH /api/admin/config          → { clave, valor } actualiza una clave

import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

const CLAVES_EDITABLES = ['limite_jugadores_por_club', 'limite_uso_plantilla'];

export async function GET() {
    try {
        const placeholders = CLAVES_EDITABLES.map(() => '?').join(',');
        const [rows]: any = await db.query(
            `SELECT clave, valor FROM Config WHERE clave IN (${placeholders})`,
            CLAVES_EDITABLES
        );
        const data = Array.isArray(rows[0]) ? rows[0] : rows;
        const config: Record<string, number> = {};
        for (const row of data) config[row.clave] = parseInt(row.valor);
        return NextResponse.json(config);
    } catch (error: any) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { clave, valor } = await req.json();

        if (!CLAVES_EDITABLES.includes(clave)) {
            return NextResponse.json({ error: "Clave no editable" }, { status: 400 });
        }
        const num = parseInt(valor);
        if (isNaN(num) || num < 1) {
            return NextResponse.json({ error: "Valor debe ser un número mayor que 0" }, { status: 400 });
        }

        await db.query(
            `INSERT INTO Config (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
            [clave, String(num)]
        );

        return NextResponse.json({ ok: true, clave, valor: num });
    } catch (error: any) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
