// src/components/SignOutButton.tsx
"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
    >
      Cerrar sesión
    </button>
  );
}
