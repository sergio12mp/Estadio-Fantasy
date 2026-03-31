// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/mysql";
import { joinGeneralLeague } from "./liga-utils";
import { fillCommonCardsForManager } from "./card-utils";

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const [dbUser]: any = await db.query(
            "SELECT * FROM Manager WHERE Email = ?",
            [user?.email]
          );
          let managerId: number;

          if (Array.isArray(dbUser) && dbUser.length === 0) {
            const result: any = await db.query(
              "INSERT INTO Manager (Nombre, idGoogle, Email, oro, balones) VALUES (?, ?, ?, 1000, 10)",
              [user.name, user.id, user.email]
            );
            managerId = result[0].insertId;
            console.log(`INFO: Nuevo manager creado con ID: ${managerId}`);

            try {
              await fillCommonCardsForManager(managerId);
            } catch (cardError) {
              console.error("Error creando cartas comunes:", cardError);
            }
          } else {
            managerId = Array.isArray(dbUser) ? dbUser[0].idManager : dbUser.idManager;
            console.log("INFO: El manager ya existe en la base de datos.");
          }

          if (managerId) {
            await joinGeneralLeague(managerId);
          }
        }
        return true;
      } catch (error) {
        console.error("Error durante el sign-in:", error);
        return false;
      }
    },
    async jwt({ token, account }) {
      if (token.email) {
        const [rows]: any = await db.query(
          "SELECT idManager, esAdmin FROM Manager WHERE Email = ?",
          [token.email]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          token.managerId = rows[0].idManager as number;
          token.esAdmin = !!rows[0].esAdmin;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.managerId) {
        session.user.managerId = token.managerId;
      }
      if (token.esAdmin !== undefined) {
        session.user.esAdmin = token.esAdmin as boolean;
      }
      return session;
    },
  },
};