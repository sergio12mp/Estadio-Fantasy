"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import AuthButton from "@/components/ui/AuthButton";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/home", label: "Inicio" },
  { href: "/mi-equipo", label: "Mi Equipo" },
  { href: "/sobres", label: "Sobres" },
  { href: "/album", label: "Álbum" },
  { href: "/ligas", label: "Ligas" },
];

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-600 dark:hover:bg-gray-700 transition-colors"
    >
      <Sun className="w-5 h-5 hidden dark:block" aria-hidden="true" />
      <Moon className="w-5 h-5 dark:hidden" aria-hidden="true" />
    </button>
  );
}

export default function NavBar() {
  const { user, currency, isAdmin } = useAuth();
  const pathname = usePathname();

  const links = isAdmin
    ? [...NAV_LINKS, { href: "/admin", label: "Admin" }]
    : NAV_LINKS;

  return (
    <nav
      aria-label="Barra de navegación"
      className="bg-blue-700 dark:bg-gray-900 text-white fixed top-0 left-0 right-0 z-50 h-[60px] shadow-md"
    >
      <div className="container mx-auto h-full px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href={user ? "/home" : "/"}
          className="text-lg font-bold tracking-tight shrink-0"
        >
          Estadio Fantasy
        </Link>

        {/* Desktop nav links */}
        {user && (
          <div className="hidden md:flex items-center gap-1 flex-1 mx-2 overflow-x-auto">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "bg-blue-900 dark:bg-gray-700 text-white"
                      : "hover:bg-blue-600 dark:hover:bg-gray-700 text-blue-100"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <ThemeToggleButton />

          {user ? (
            <>
              {/* Monedas — visible en desktop */}
              <span className="text-sm text-blue-200 hidden md:inline" aria-label={`${currency.oro.toLocaleString()} monedas de oro, ${currency.balones} balones`}>
                🪙 {currency.oro.toLocaleString()} &nbsp;⚽ {currency.balones}
              </span>
              {/* Monedas compactas — visible solo en móvil */}
              <span className="text-xs text-blue-200 md:hidden" aria-hidden="true">
                🪙 {currency.oro.toLocaleString()}
              </span>
              <Link
                href="/mi-perfil"
                aria-label="Mi perfil"
                className="hidden md:inline text-sm hover:text-white text-blue-200 transition-colors"
              >
                {user.name?.split(" ")[0]}
              </Link>
              <AuthButton variant="signOut" />
            </>
          ) : (
            <AuthButton variant="signIn" />
          )}
        </div>
      </div>
    </nav>
  );
}
