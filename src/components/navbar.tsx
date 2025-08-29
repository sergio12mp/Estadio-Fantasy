"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import SignOutButton from "./SignOutButton";
import LoginButton from "./LoginButton";

export default function NavBar() {
  const { user, currency } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Mi Aplicación
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/about" className="hover:underline">
            Sobre nosotros
          </Link>

          {user ? (
            <>
              <span className="mr-2">
                {user.displayName} - {currency.oro} oro · {currency.balones} balones
              </span>
              <Link href="/sobres" className="hover:underline">Abrir Sobres</Link>
              <Link href="/album" className="hover:underline">Álbum</Link>
              <Link href="/mi-perfil" className="hover:underline">Mi Perfil</Link>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/mi-equipo" className="hover:underline">Mi Equipo</Link>
              <Link href="/ligas" className="hover:underline">Mis Ligas</Link>
              <SignOutButton />
            </>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
}
