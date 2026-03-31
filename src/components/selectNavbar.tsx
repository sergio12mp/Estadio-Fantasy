// app/dashboard/selectNavbar.tsx

"use client";

import { useAuth } from "@/context/auth-context";
import NavBar from "./navbar";
import { NavbarLite } from "./navbarLite";

export function SelectNavbar() {
  const { user } = useAuth();
  return user ? <NavBar /> : <NavbarLite />;
}
