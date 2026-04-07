// import mysql from "serverless-mysql";
import mysql from "mysql2/promise";

// export const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "root",
//   port: 3306,
//   database: "mydb",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

export const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),
  ssl: {
    rejectUnauthorized: false // Obligatorio para conexiones remotas seguras
  }
});