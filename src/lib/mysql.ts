// import mysql from "serverless-mysql";
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  port: 3306,
  database: "mydb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// export const db = await mysql.createPool({
//     host: "estadio-fantasy-db.czs6k4wui7k8.eu-north-1.rds.amazonaws.com", // <- tu endpoint
//     user: "root",           // o el nombre que pusiste
//     database: "estadio-fantasy-db", // asegúrate de crearla si no existe
//     password: "estadiofantasy", // <- tu contraseña
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//   });