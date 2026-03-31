// src/components/SignInButton.tsx
"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded"
    >
      Iniciar sesión con Google
    </button>
  );
}
