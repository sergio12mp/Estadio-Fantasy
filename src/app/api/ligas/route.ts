import {NextRequest,NextResponse } from "next/server";
import {db} from "@/libs/mysql";

export async function GET() {
    try {
        let result = await db.query("SELECT * FROM mydb.ligas");
        if (!result) {
            console.log("No se encontraron ligas");
            return NextResponse.json({ message: "No se encontraron ligas" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Ligas encontradas", result });
    } catch (error) {
        console.error("Error al obtener las ligas:", error);
        return NextResponse.json({ message: "Error al obtener las ligas", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre, Descripcion } = await req.json();

        if (!Nombre || !Descripcion) {
            return NextResponse.json({ message: "Nombre y Descripcion son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.ligas (Nombre, Descripcion) VALUES (?, ?)", [Nombre, Descripcion]);

        console.log("Liga insertada:", result);
        return NextResponse.json({ message: "Liga insertada exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando liga:", error);
        return NextResponse.json({ message: "Error insertando liga", error }, { status: 500 });
    }
}
//He introducido esto en la bd para que funcione con la version 8 de mysql y no de error de autenticacion.
//MySQL usa caching_sha2_password por defecto en la versión 8.0.4 y posterior. 
//Para cambiarlo a mysql_native_password, puedes hacerlo con el siguiente comando SQL:
//ALTER USER 'tu_usuario'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';
//FLUSH PRIVILEGES;