// src/components/LoginButton.tsx
"use client";

import { signIn, signOut } from "next-auth/react";
import { useAuth } from "@/context/auth-context";

export default function LoginButton() {
  const { user } = useAuth();

  return user ? (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-red-500 text-white px-3 py-1 rounded"
    >
      Cerrar sesión
    </button>
  ) : (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="bg-blue-600 text-white px-3 py-1 rounded"
    >
      Iniciar sesión con Google
    </button>
  );
}
