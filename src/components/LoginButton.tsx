// src/components/LoginButton.tsx
"use client";

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";

export default function LoginButton() {
  const { user } = useAuth();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  return user ? (
    <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
      Cerrar sesión
    </button>
  ) : (
    <button onClick={handleLogin} className="bg-blue-600 text-white px-3 py-1 rounded">
      Iniciar sesión con Google
    </button>
  );
}
