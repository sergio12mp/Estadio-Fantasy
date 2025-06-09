// app/login/page.tsx
"use client";

import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Asegúrate de que la ruta sea correcta
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Ya está logueado, redirigir
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace("/");
    } catch (error: any) {
      console.error("Login error", error.message);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg flex flex-col items-center">
        <h1 className="text-2xl font-semibold mb-6">Inicia sesión</h1>
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Iniciar sesión con Google
        </button>
      </div>
    </main>
  );
}
