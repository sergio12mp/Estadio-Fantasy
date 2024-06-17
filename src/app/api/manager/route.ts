import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Manager {
    idManager: number;
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.manager") as Manager[];
        if (!result.length) {
            console.log("No se encontraron managers");
            return NextResponse.json({ message: "No se encontraron managers" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Managers encontrados", result });
    } catch (error) {
        console.error("Error al obtener los managers:", error);
        return NextResponse.json({ message: "Error al obtener los managers", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { idManager } = await req.json();

        if (!idManager) {
            return NextResponse.json({ message: "idManager es requerido" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.manager (idManager) VALUES (?)", [idManager]) as any;

        console.log("Manager insertado:", result);
        return NextResponse.json({ message: "Manager insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando manager:", error);
        return NextResponse.json({ message: "Error insertando manager", error }, { status: 500 });
    }
}
