// app/dashboard/selectNavbar.tsx

"use client";

import { useAuth } from "@/context/auth-context";
import NavBar from "@/components/layout/navbar";
import { NavbarLite } from "@/components/layout/navbarLite";

export function SelectNavbar() {
  const { user } = useAuth();
  return user ? <NavBar /> : <NavbarLite />;
}
