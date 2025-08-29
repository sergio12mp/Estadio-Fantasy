// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/mysql";
import { joinGeneralLeague } from "./liga-utils"; // <-- Importamos la nueva función

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account.provider === "google") {
          // Query the database for a user with the given email
          const [dbUser]: any = await db.query("SELECT * FROM mydb.Manager WHERE Email = ?", [user?.email]);
          let managerId;

          if (Array.isArray(dbUser) && dbUser.length === 0) {
            // Si el usuario no existe, lo insertamos en la base de datos
            const result: any = await db.query(
              "INSERT INTO mydb.Manager (Nombre, idGoogle, Email) VALUES (?, ?, ?)",
              [user.name, user.id, user.email]
            );
            managerId = result.insertId;
            console.log(`INFO: Nuevo manager creado con ID: ${managerId}`);
            
          } else {
            // Si el usuario existe, obtenemos su ID
            managerId = Array.isArray(dbUser) ? dbUser[0].idManager : dbUser.idManager;
            console.log("INFO: El manager ya existe en la base de datos.");
          }

          // ASIGNAR EL MANAGER A LA LIGA GENERAL
          if (managerId) {
             await joinGeneralLeague(managerId); // <-- Llamamos a la nueva función
          }
          
        }
        return true; // Retorna true para continuar el proceso de inicio de sesión
      } catch (error) {
        console.error("Error durante el sign-in:", error);
        return false; // Retorna false si hay un error para detener el sign-in
      }
    },
    // Añade el resto de tus callbacks aquí si los tienes
  },
};