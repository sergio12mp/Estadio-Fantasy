// src/components/SignOutButton.tsx
"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
    >
      Cerrar sesión
    </button>
  );
}
