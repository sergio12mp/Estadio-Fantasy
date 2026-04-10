// src/components/AuthButton.tsx
// Botón de autenticación unificado. Reemplaza LoginButton, SignInButton y SignOutButton.
"use client";

import { signIn, signOut } from "next-auth/react";
import { useAuth } from "@/context/auth-context";

interface AuthButtonProps {
  /** "auto" detecta si hay sesión; "signIn"/"signOut" fuerzan la acción */
  variant?: "auto" | "signIn" | "signOut";
  className?: string;
}

export default function AuthButton({ variant = "auto", className }: AuthButtonProps) {
  const { user } = useAuth();
  const isSignedIn = variant === "auto" ? !!user : variant === "signOut";

  if (isSignedIn) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className={className ?? "bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"}
      >
        Cerrar sesión
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className={className ?? "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"}
    >
      Iniciar sesión con Google
    </button>
  );
}
