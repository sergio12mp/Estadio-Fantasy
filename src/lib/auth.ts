// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/mysql";
import { queryOne, queryRows } from "@/lib/db-utils";
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
          const existing = await queryOne<{ idManager: number }>(
            "SELECT idManager FROM Manager WHERE Email = ?",
            [user?.email]
          );
          let managerId: number;

          if (!existing) {
            const result: any = await db.query(
              "INSERT INTO Manager (Nombre, idGoogle, Email, oro, balones) VALUES (?, ?, ?, 1000, 10)",
              [user.name, user.id, user.email]
            );
            managerId = result[0].insertId;
            // console.log(`INFO: Nuevo manager creado con ID: ${managerId}`);

            try {
              await fillCommonCardsForManager(managerId);
            } catch (cardError) {
              console.error("Error creando cartas comunes:", cardError);
            }
          } else {
            managerId = existing.idManager;
            // console.log("INFO: El manager ya existe en la base de datos.");
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
        const row = await queryOne<{ idManager: number; esAdmin: number }>(
          "SELECT idManager, esAdmin FROM Manager WHERE Email = ?",
          [token.email]
        );
        if (row) {
          token.managerId = row.idManager;
          token.esAdmin = !!row.esAdmin;
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
