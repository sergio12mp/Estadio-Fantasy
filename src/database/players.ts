"use server";
import { db } from "@/lib/mysql";
import { Equipo, Jugador } from "@/lib/data";

export async function GetEquipos() {
    const rows = await db.query("SELECT * FROM Equipo");
    // Transforma las filas en objetos planos
    const plainRows = JSON.parse(JSON.stringify(rows));
    //console.log("basedatos");
    //console.log(plainRows);
    return plainRows;
}

export async function GetDefensas() {
    const rows = await db.query("SELECT * FROM Jugador where Posicion = 'RB' or Posicion = 'CB'  or Posicion = 'LB'");
    const plainRows = JSON.parse(JSON.stringify(rows));
    //console.log(rows);
    return rows;
}
export async function GetAtacantes() {
    const rows = await db.query("SELECT * FROM Jugador where Posicion = 'RW' or Posicion = 'ST'  or Posicion = 'FW'");
    const plainRows = JSON.parse(JSON.stringify(rows));
    //console.log(rows);
    return rows;
}

export async function GetMediocampistas() {
    const rows = await db.query("SELECT * FROM Jugador where Posicion = 'CM' or Posicion = 'RM'  or Posicion = 'LM' or Posicion = 'AM'"); //AM parace ser Advanced Midfielder
    const plainRows = JSON.parse(JSON.stringify(rows));
    //console.log(rows);
    return rows;
}

export async function GetPorteros() {
    const rows = await db.query("SELECT * FROM Jugador where Posicion = 'GK'");
    const plainRows = JSON.parse(JSON.stringify(rows));
    //console.log(rows);  
    return rows;
}
export async function GetJugadores() {

    
    const [rowsResult] = await db.query("SELECT * FROM Jugador") as [Jugador[], any];
    const plainRows: any[] = rowsResult.map((row: Jugador) => ({ ...row })); // Crea una copia plana de cada objeto
    console.log("GETJUGADORES");    
    console.log(plainRows);
    return plainRows;
}
/*
export async function GetJugadores() {
    const query = `
    SELECT jugador.*,equipo.Nombre AS NombreEquipo FROM jugador JOIN equipo ON jugador.idEquipo = equipo.idEquipo;    `;

    const rows = await db.query(query);
    return JSON.parse(JSON.stringify(rows));
}*/

