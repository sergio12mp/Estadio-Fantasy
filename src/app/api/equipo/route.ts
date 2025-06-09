import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mysql";
import { Equipo } from "@/lib/data";
import { NextApiRequest, NextApiResponse } from 'next';
import { GetEquipos } from '@/database/players';


export async function GET() {
    try {
        console.log("GET EQUIPOS");
        //const result = await db.query("SELECT * FROM mydb.equipo") as Equipo[];
        const result =  await GetEquipos();
        if (!result.length) {
            console.log("No se encontraron equipos GET");
            return NextResponse.json({ message: "No se encontraron equipos" }, { status: 404 });
        }
        //console.log(result);
        return NextResponse.json( result );
    } catch (error) {
        console.error("Error al obtener los equipos:", error);
        return NextResponse.json({ message: "Error al obtener los equipos", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre } = await req.json();

        if (!Nombre) {
            return NextResponse.json({ message: "Nombre es requerido" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.equipo (Nombre) VALUES (?)", [Nombre]) as any;

        console.log("Equipo insertado:", result);
        return NextResponse.json({ message: "Equipo insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando equipo:", error);
        return NextResponse.json({ message: "Error insertando equipo", error }, { status: 500 });
    }
}

export async function handlerEquipos(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const equipos = await GetEquipos();
            // Asegúrate de que equipos sea un array
            if (!Array.isArray(equipos)) {
                throw new Error('La respuesta no es un array.');
            }
            console.log("EQUIPOSServidor");
            console.log(equipos);
            res.status(200).json(equipos);
            return NextResponse.json({ message: "Equipos encontrados", res });

        } catch (error) {
            console.error('Error fetching equipos:', error);
            res.status(500).json({ error: 'Error fetching equipos' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}