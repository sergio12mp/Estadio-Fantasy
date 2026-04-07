import { NextResponse } from "next/server";
import { db } from "@/lib/mysql";

const BOT_NAMES = [
    "Bot Merengue",
    "Bot Culé",
    "Bot Colchonero",
    "Bot Txuri-Urdin",
    "Bot Nervionense",
];

const ORO_INICIAL = 500; // oro suficiente para ~50 sobres normales

export async function POST() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Liga General
        const [ligaRows]: any = await connection.query(
            "SELECT idLigas FROM Ligas WHERE tipo = 'general' LIMIT 1"
        );
        if (!ligaRows?.length) {
            await connection.rollback();
            return NextResponse.json({ error: "No existe la Liga General" }, { status: 400 });
        }
        const idLigaGeneral = ligaRows[0].idLigas;

        // Todos los jugadores
        const [jugadores]: any = await connection.query("SELECT idJugador FROM Jugador");
        if (!jugadores?.length) {
            await connection.rollback();
            return NextResponse.json({ error: "No hay jugadores en la base de datos" }, { status: 400 });
        }

        const botsCreados: string[] = [];

        for (const nombre of BOT_NAMES) {
            // Comprobar si ya existe
            const [existing]: any = await connection.query(
                "SELECT idManager FROM Manager WHERE Nombre = ? AND isBot = 1",
                [nombre]
            );
            if (existing?.length) {
                botsCreados.push(`${nombre} (ya existía)`);
                continue;
            }

            // Crear manager bot con oro inicial
            const [managerResult]: any = await connection.query(
                `INSERT INTO Manager (Nombre, idGoogle, Email, esAdmin, oro, balones, puntuacion_actual, pity, isBot)
                 VALUES (?, ?, ?, 0, ?, 0, 0, 0, 1)`,
                [
                    nombre,
                    `bot_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    `${nombre.replace(/\s+/g, "").toLowerCase()}@bot.local`,
                    ORO_INICIAL,
                ]
            );
            const idManager = managerResult.insertId;

            // Cartas comunes en bulk (una por jugador)
            const cartaValues = jugadores.map((j: any) => [j.idJugador, idManager, "Comun"]);
            await connection.query(
                "INSERT INTO CartaJugador (Jugador_idJugador, Manager_idManager, rareza) VALUES ?",
                [cartaValues]
            );

            // Unir a la Liga General
            await connection.query(
                "INSERT INTO Manager_Ligas (Manager_idManager, Ligas_idLigas, puntuacion_actual) VALUES (?, ?, 0)",
                [idManager, idLigaGeneral]
            );

            botsCreados.push(nombre);
        }

        await connection.commit();
        return NextResponse.json({
            message: "Bots creados correctamente",
            bots: botsCreados,
            jugadoresAsignados: jugadores.length,
        });
    } catch (error: any) {
        await connection.rollback();
        console.error("Error creando bots:", error);
        return NextResponse.json({ error: "Error al crear bots", detail: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}
