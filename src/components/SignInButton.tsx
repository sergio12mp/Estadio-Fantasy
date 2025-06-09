// src/components/SignInButton.tsx

"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignInButton() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuario autenticado:", result.user);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded"
    >
      Iniciar sesión con Google (Firebase)
    </button>
  );
}
