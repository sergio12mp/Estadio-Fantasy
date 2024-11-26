"use server";
import {db} from "@/libs/mysql";

export async function GetEquipos() {
    const [rows]: any = await db.query("SELECT * FROM mydb.equipo");
    console.log("EQUIPOS");
    
    // Transforma las filas en objetos planos
    const plainRows = JSON.parse(JSON.stringify(rows));
    
    console.log(plainRows);
    return plainRows;
}

export  async function GetDefensas() {
  const [rows]: any = await db.query("SELECT * FROM mydb.jugador where Posicion = 'RB' or Posicion = 'CB'  or Posicion = 'LB'");
  console.log(rows);
  return rows;
}
export async function GetAtacantes() {
    const [rows]: any = await db.query("SELECT * FROM mydb.jugador where Posicion = 'RW' or Posicion = 'ST'  or Posicion = 'FW'");
    console.log(rows);
    return rows;
    }

export async function GetMediocampistas() {
    const [rows]: any = await db.query("SELECT * FROM mydb.jugador where Posicion = 'CM' or Posicion = 'RM'  or Posicion = 'LM' or Posicion = 'AM'"); //AM parace ser Advanced Midfielder
    console.log(rows);
    return rows;
    }

export async function GetPorteros() {
    const [rows]: any = await db.query("SELECT * FROM mydb.jugador where Posicion = 'GK'");
    console.log(rows);  
    return rows;
    }
