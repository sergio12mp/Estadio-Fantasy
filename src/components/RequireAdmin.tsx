"use client";

import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, manager, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!manager) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/");
    }
  }, [loading, manager, isAdmin, router]);

  if (loading || !manager || !isAdmin) {
    return <p>Cargando permisos...</p>;
  }

  return <>{children}</>;
}
