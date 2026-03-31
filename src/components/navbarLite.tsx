"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export function NavbarLite() {
  return (
    <nav className="bg-blue-800 text-white px-6 fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center shadow-md">
      <Link href="/" className="text-lg font-bold tracking-tight flex-1">
        Estadio Fantasy
      </Link>
      <button
        onClick={() => signIn("google", { callbackUrl: "/home" })}
        className="bg-white text-blue-700 font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-blue-50 transition-colors"
      >
        Iniciar sesión con Google
      </button>
    </nav>
  );
}
