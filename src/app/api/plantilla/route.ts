// app/api/plantilla/route.ts
import { db } from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";
import { getPosicionFrontend } from '@/lib/data'; // <--- ¡CAMBIO AQUÍ!

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const managerId = searchParams.get("managerId");
        const idJornada = searchParams.get("idJornada");

        if (!managerId || !idJornada) {
            return NextResponse.json({ error: "Faltan parámetros managerId o idJornada" }, { status: 400 });
        }

        const managerIdNum = parseInt(managerId as string);
        const idJornadaNum = parseInt(idJornada as string);

        if (isNaN(managerIdNum) || isNaN(idJornadaNum)) {
            return NextResponse.json({ error: "managerId o idJornada no son números válidos" }, { status: 400 });
        }

        // Primero, obtener la plantilla principal
        const [plantillaRows]: any = await db.query(
            `SELECT idPlantilla, Alineacion, Puntos, idJornada, idManager
             FROM Plantilla
             WHERE idManager = ? AND idJornada = ?`,
            [managerIdNum, idJornadaNum]
        );

        const plantilla = Array.isArray(plantillaRows[0]) ? plantillaRows[0][0] : plantillaRows[0];

        if (!plantilla) {
            return NextResponse.json({ error: "Plantilla no encontrada para la jornada y manager especificados." }, { status: 404 });
        }

        // Luego, obtener los jugadores y objetos asociados a esa plantilla
        const [jugadoresEnCampoRows]: any = await db.query(
            `SELECT
                pjo.idCartaJugador,
                pjo.idCartaObjeto,
                pjo.posicionEnPlantilla,
                cj.Rareza AS RarezaCartaJugador,
                j.idJugador, j.Nombre AS NombreJugador, j.Posicion AS PosicionJugadorDB, j.Edad, j.Pais, j.Precio, j.Puntos,
                e.Nombre AS NombreEquipo,
                co.Rareza AS RarezaCartaObjeto,
                o.Nombre AS NombreObjeto, o.Descripcion AS DescripcionObjeto,
                o.idObjetos AS idObjetos -- Asegúrate de seleccionar idObjetos si lo necesitas en el frontend
             FROM PlantillaJugadorObjeto pjo
             JOIN CartaJugador cj ON pjo.idCartaJugador = cj.idCartaJugador
             JOIN Jugador j ON cj.Jugador_idJugador = j.idJugador
             JOIN Equipo e ON j.idEquipo = e.idEquipo
             LEFT JOIN CartaObjeto co ON pjo.idCartaObjeto = co.idCartaObjeto -- Usar LEFT JOIN para objetos
             LEFT JOIN Objetos o ON co.idObjetos = o.idObjetos -- Usar LEFT JOIN para objetos
             WHERE pjo.idPlantilla = ?
             ORDER BY pjo.posicionEnPlantilla`,
            [plantilla.idPlantilla]
        );

        const jugadoresEnCampoData = Array.isArray(jugadoresEnCampoRows[0]) ? jugadoresEnCampoRows[0] : jugadoresEnCampoRows;

        // Reestructurar los datos para que coincidan con CartaJugadorEnPlantilla
        const jugadoresEnCampo = jugadoresEnCampoData.map((row: any) => ({
            idJugador: row.idJugador,
            idCartaJugador: row.idCartaJugador,
            Nombre: row.NombreJugador,
            Edad: row.Edad,
            Pais: row.Pais,
            Posicion: row.PosicionJugadorDB, // Posición de la DB
            PosicionFrontend: getPosicionFrontend(row.PosicionJugadorDB), // <--- ¡USAR getPosicionFrontend aquí!
            NombreEquipo: row.NombreEquipo,
            Rareza: row.RarezaCartaJugador,
            Puntos: row.Puntos,
            objetosEquipados: row.idCartaObjeto ? [{
                idCartaObjeto: row.idCartaObjeto,
                idObjetos: row.idObjetos,
                Nombre: row.NombreObjeto,
                Rareza: row.RarezaCartaObjeto,
                Descripcion: row.DescripcionObjeto,
            }] : [],
            maxObjetosSlots: 0, // Esto se calculará en el frontend
            posicionEnPlantilla: row.posicionEnPlantilla,
        }));

        // Asegurarse de que `jugadoresEnCampo` sea un array esparso de 11 elementos
        // esto es clave para que el frontend pueda mapear las posiciones correctamente
        const jugadoresEnCampoSparse: (typeof jugadoresEnCampo[number] | null)[] = Array(11).fill(null);
        jugadoresEnCampo.forEach((jugador: any) => {
            if (jugador.posicionEnPlantilla !== undefined && jugador.posicionEnPlantilla >= 0 && jugador.posicionEnPlantilla < 11) {
                jugadoresEnCampoSparse[jugador.posicionEnPlantilla] = jugador;
            }
        });

        return NextResponse.json({ plantilla, jugadoresEnCampo: jugadoresEnCampoSparse }, { status: 200 });

    } catch (error: any) {
        console.error("❌ CRITICAL ERROR: Fallo al cargar plantilla:", error);
        if (error.code) console.error("SQL Error Code:", error.code);
        if (error.sqlMessage) console.error("SQL Error Message:", error.sqlMessage);
        return NextResponse.json({ error: "Error interno del servidor al cargar plantilla." }, { status: 500 });
    }
}
// app/api/plantilla/route.ts (continúa del GET, añade este POST abajo)

// app/api/plantilla/route.ts (POST - PARTE MODIFICADA)

export async function POST(req: NextRequest) {
    try {
        const { managerId, idJornada, alineacionLabel, jugadoresParaGuardar } = await req.json();

        if (!managerId || !idJornada || !alineacionLabel || !Array.isArray(jugadoresParaGuardar)) {
            return NextResponse.json({ error: "Faltan datos requeridos para guardar la plantilla." }, { status: 400 });
        }

        const managerIdNum = parseInt(managerId as string);
        const idJornadaNum = parseInt(idJornada as string);

        if (isNaN(managerIdNum) || isNaN(idJornadaNum)) {
            return NextResponse.json({ error: "managerId o idJornada no son números válidos." }, { status: 400 });
        }

        let idPlantillaActual: number;

        // Paso 1: Verificar si ya existe una plantilla para esta jornada y manager
        // Usar transacciones para asegurar la atomicidad de la operación
        await db.query("START TRANSACTION"); // Iniciar transacción

        try {
            const [existingPlantillaResult]: any = await db.query(
                "SELECT idPlantilla FROM Plantilla WHERE idManager = ? AND idJornada = ?",
                [managerIdNum, idJornadaNum]
            );
            const existingPlantillaRows = Array.isArray(existingPlantillaResult[0]) ? existingPlantillaResult[0] : existingPlantillaResult;

            if (existingPlantillaRows.length > 0) {
                // Plantilla existente: Obtener su ID y limpiar entradas anteriores
                idPlantillaActual = existingPlantillaRows[0].idPlantilla;
                console.log(`INFO: Plantilla existente (${idPlantillaActual}) para Manager ${managerIdNum}, Jornada ${idJornadaNum}. Borrando entradas anteriores.`);
                await db.query("DELETE FROM PlantillaJugadorObjeto WHERE idPlantilla = ?", [idPlantillaActual]);
                // Opcional: Actualizar la alineación y puntos en la tabla Plantilla
                await db.query(
                    "UPDATE Plantilla SET Alineacion = ?, Puntos = ? WHERE idPlantilla = ?",
                    [alineacionLabel, 0, idPlantillaActual]
                );
            } else {
                // Nueva plantilla: Insertar en la tabla Plantilla
                console.log(`INFO: Creando nueva plantilla para Manager ${managerIdNum}, Jornada ${idJornadaNum}.`);
                const [insertPlantillaResult]: any = await db.query(
                    "INSERT INTO Plantilla (Alineacion, Puntos, idJornada, idManager) VALUES (?, ?, ?, ?)",
                    [alineacionLabel, 0, idJornadaNum, managerIdNum]
                );
                idPlantillaActual = insertPlantillaResult.insertId ?? insertPlantillaResult[0]?.insertId;

                if (!idPlantillaActual) {
                    throw new Error("No se pudo obtener el ID de la plantilla recién creada.");
                }
                console.log(`INFO: Nueva plantilla creada con ID: ${idPlantillaActual}`);
            }

            // Paso 2: Insertar los jugadores y sus objetos en PlantillaJugadorObjeto
            if (jugadoresParaGuardar.length > 0) {
                const valuesToInsert: (number | null)[][] = []; // Usamos un array de arrays para los valores
                for (const jugador of jugadoresParaGuardar) {
                    const idCartaJugador = jugador.idCartaJugador;
                    const posicionEnPlantilla = jugador.posicionEnPlantilla; // ¡Obtenemos la posición aquí!
                    const idCartaObjeto = jugador.objetosEquipados && jugador.objetosEquipados.length > 0
                        ? jugador.objetosEquipados[0].idCartaObjeto
                        : null; // Usar null en lugar de 0 si la columna lo permite

                    if (idCartaObjeto === null) {
                        console.warn(`WARN: Jugador ${idCartaJugador} en plantilla ${idPlantillaActual} (posición ${posicionEnPlantilla}) no tiene objeto. Insertando con idCartaObjeto NULL.`);
                    }

                    // Asegurarse de que posicionEnPlantilla sea un número válido
                    if (posicionEnPlantilla === undefined || posicionEnPlantilla === null || isNaN(posicionEnPlantilla)) {
                         throw new Error(`Posición inválida para el jugador ${idCartaJugador}.`);
                    }

                    // Los valores deben ser un array para el INSERT batch
                    valuesToInsert.push([idPlantillaActual, idCartaObjeto, idCartaJugador, posicionEnPlantilla]);
                }

                if (valuesToInsert.length > 0) {
                    // Consulta con múltiples VALUES
                    const insertQuery = `INSERT INTO PlantillaJugadorObjeto (idPlantilla, idCartaObjeto, idCartaJugador, posicionEnPlantilla) VALUES ?`;
                    console.log(`DEBUG: Ejecutando inserción de ${valuesToInsert.length} filas en PlantillaJugadorObjeto.`);
                    await db.query(insertQuery, [valuesToInsert]); // Pasar un array de arrays
                    console.log(`INFO: ${valuesToInsert.length} entradas insertadas/actualizadas en PlantillaJugadorObjeto.`);
                }
            } else {
                console.log(`INFO: No hay jugadores para guardar en la plantilla para Manager ${managerIdNum}, Jornada ${idJornadaNum}.`);
            }

            await db.query("COMMIT"); // Confirmar transacción
            return NextResponse.json({ message: "Plantilla guardada exitosamente.", idPlantilla: idPlantillaActual }, { status: 200 });

        } catch (transactionError: any) {
            await db.query("ROLLBACK"); // Revertir transacción en caso de error
            throw transactionError; // Re-lanzar el error para que sea capturado por el catch externo
        }

    } catch (error: any) {
        console.error("❌ CRITICAL ERROR: Fallo al guardar plantilla:", error);
        if (error.code) console.error("SQL Error Code:", error.code);
        if (error.sqlMessage) console.error("SQL Error Message:", error.sqlMessage);
        return NextResponse.json({ error: "Error interno del servidor al guardar plantilla: " + error.message }, { status: 500 });
    }
}