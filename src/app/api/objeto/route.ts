import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";

interface Objetos {
    idObjetos: number;
    Nombre: string;
    Precio: number;
    Descripcion: string;
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.objetos") as Objetos[];
        if (!result.length) {
            console.log("No se encontraron objetos");
            return NextResponse.json({ message: "No se encontraron objetos" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Objetos encontrados", result });
    } catch (error) {
        console.error("Error al obtener los objetos:", error);
        return NextResponse.json({ message: "Error al obtener los objetos", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre, Precio, Descripcion } = await req.json();

        if (!Nombre || !Precio || !Descripcion) {
            return NextResponse.json({ message: "Nombre, Precio y Descripcion son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.objetos (Nombre, Precio, Descripcion) VALUES (?, ?, ?)", [Nombre, Precio, Descripcion]) as any;

        console.log("Objeto insertado:", result);
        return NextResponse.json({ message: "Objeto insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando objeto:", error);
        return NextResponse.json({ message: "Error insertando objeto", error }, { status: 500 });
    }
}
