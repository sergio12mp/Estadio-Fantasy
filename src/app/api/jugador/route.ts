import { NextRequest, NextResponse } from "next/server";
import { db } from "@/libs/mysql";
import { NextApiRequest, NextApiResponse } from 'next';
import { GetDefensas } from "@/database/players";
import { GetAtacantes } from "@/database/players";
import {GetMediocampistas} from "@/database/players";
import {GetPorteros} from "@/database/players";

interface Jugador {
    idJugador: number;
    Nombre: string;
    Edad: string;
    Pais: string;
    Posicion: string;
    Precio: number;
    idEquipo: number;
}

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM mydb.jugador") as Jugador[];
        if (!result.length) {
            console.log("No se encontraron jugadores");
            return NextResponse.json({ message: "No se encontraron jugadores" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Jugadores encontrados", result });
    } catch (error) {
        console.error("Error al obtener los jugadores:", error);
        return NextResponse.json({ message: "Error al obtener los jugadores", error }, { status: 500 });
    }
}

export async function GETporPrecio(req: NextRequest) {
    try {
        const result = await db.query("SELECT * FROM mydb.jugador WHERE Precio > ") as Jugador[];
        if (!result.length) {
            console.log("No se encontraron jugadores");
            return NextResponse.json({ message: "No se encontraron jugadores" }, { status: 404 });
        }
        console.log(result);
        return NextResponse.json({ message: "Jugadores encontrados", result });
    } catch (error) { 
        console.error("Error al obtener los jugadores:", error);
        return NextResponse.json({ message: "Error al obtener los jugadores", error }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { Nombre, Edad, Pais, Posicion, Precio, idEquipo } = await req.json();

        if (!Nombre || !Edad || !Pais || !Posicion || !Precio || !idEquipo) {
            return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
        }

        const result = await db.query("INSERT INTO mydb.jugador (Nombre, Edad, Pais, Posicion, Precio, idEquipo) VALUES (?, ?, ?, ?, ?, ?)", [Nombre, Edad, Pais, Posicion, Precio, idEquipo]) as any;

        console.log("Jugador insertado:", result);
        return NextResponse.json({ message: "Jugador insertado exitosamente", result }, { status: 201 });
    } catch (error) {
        console.error("Error insertando jugador:", error);
        return NextResponse.json({ message: "Error insertando jugador", error }, { status: 500 });
    }
}

export  async function handlerPorteros(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const porteros = await GetPorteros();
            res.status(200).json(porteros);
        } catch (error) {
            console.error('Error fetching porteros:', error);
            res.status(500).json({ error: 'Error fetching porteros' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
export  async function handlerDefensas(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const porteros = await GetDefensas();
            res.status(200).json(porteros);
        } catch (error) {
            console.error('Error fetching porteros:', error);
            res.status(500).json({ error: 'Error fetching porteros' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
export  async function handlerCentrocampistas(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const porteros = await GetMediocampistas();
            res.status(200).json(porteros);
        } catch (error) {
            console.error('Error fetching porteros:', error);
            res.status(500).json({ error: 'Error fetching porteros' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
export  async function handlerAtacantes(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const porteros = await GetAtacantes();
            res.status(200).json(porteros);
        } catch (error) {
            console.error('Error fetching porteros:', error);
            res.status(500).json({ error: 'Error fetching porteros' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}