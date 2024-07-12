import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";
import { Participaciones } from "@/libs/data";


export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.participaciones") as Participaciones[];
        if (!result.length) {
            console.log("No se encontraron participaciones");
            return NextResponse.json({ message: "No se encontraron participaciones" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Participaciones encontradas", result });
    } catch (error) {
        console.error("Error al obtener las participaciones:", error);
        return NextResponse.json({ message: "Error al obtener las participaciones", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { idManager, idLigas } = await req.json();

        if (!idManager || !idLigas) {
            return NextResponse.json({ message: "idManager y idLigas son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.participaciones (idManager, idLigas) VALUES (?, ?)", [idManager, idLigas]) as any;

        console.log("Participación insertada:", result);
        return NextResponse.json({ message: "Participación insertada exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando participación:", error);
        return NextResponse.json({ message: "Error insertando participación", error }, { status: 500 });
    }
}
