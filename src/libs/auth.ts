import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/libs/mysql";
import { Console } from "console";
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
          console.log(dbUser);
          if (!dbUser) {
            // If the user does not exist, insert them into the database
            const result: any = await db.query(
              "INSERT INTO mydb.Manager (Nombre, idGoogle, Email) VALUES (?, ?, ?)",
              [user.name, user.id, user.email]
            );
            // Update the user's id with the new database entry's id
            user.id = result.insertId;
          } else {
            // If the user exists, you might want to update their information or just proceed
            console.log("User already exists in the database.");
          }
        }
        return true; // Return true to signify successful sign in
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false; // Return false to prevent sign in if an error occurs
      }
    },
  },
};