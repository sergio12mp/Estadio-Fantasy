"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import SignOutButton from "./SignOutButton";
import LoginButton from "./LoginButton";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/home", label: "Inicio" },
  { href: "/mi-equipo", label: "Mi Equipo" },
  { href: "/sobres", label: "Sobres" },
  { href: "/album", label: "Álbum" },
  { href: "/ligas", label: "Ligas" },
];

function ThemeToggleButton() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
    >
      {dark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

export default function NavBar() {
  const { user, currency, isAdmin } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el menú al navegar
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const links = isAdmin
    ? [...NAV_LINKS, { href: "/admin", label: "Admin" }]
    : NAV_LINKS;

  return (
    <nav className="bg-blue-700 dark:bg-gray-900 text-white fixed top-0 left-0 right-0 z-50 h-[60px] shadow-md">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? "/home" : "/"} className="text-lg font-bold tracking-tight shrink-0">
          Estadio Fantasy
        </Link>

        {/* Desktop nav links */}
        {user && (
          <div className="hidden md:flex items-center gap-1 mx-4 overflow-x-auto">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-blue-900 dark:bg-gray-700 text-white"
                      : "hover:bg-blue-600 dark:hover:bg-gray-700 text-blue-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggleButton />

          {user ? (
            <>
              <span className="text-sm text-blue-200 hidden md:inline">
                🪙 {currency.oro.toLocaleString()} &nbsp;⚽ {currency.balones}
              </span>
              <Link
                href="/mi-perfil"
                className="text-sm hover:text-white text-blue-200 transition-colors hidden md:inline"
              >
                {user.name?.split(" ")[0]}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <LoginButton />
          )}

          {/* Hamburger (mobile only) */}
          {user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
              className="md:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {user && menuOpen && (
        <div className="md:hidden bg-blue-800 dark:bg-gray-800 border-t border-blue-600 dark:border-gray-700 px-4 py-3 space-y-1 shadow-lg">
          {/* Currency on mobile */}
          <p className="text-xs text-blue-300 pb-2 border-b border-blue-700 dark:border-gray-600">
            🪙 {currency.oro.toLocaleString()} &nbsp;⚽ {currency.balones}
          </p>
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-900 dark:bg-gray-700 text-white"
                    : "hover:bg-blue-700 dark:hover:bg-gray-700 text-blue-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/mi-perfil"
            className="block px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors"
          >
            Mi perfil
          </Link>
        </div>
      )}
    </nav>
  );
}
