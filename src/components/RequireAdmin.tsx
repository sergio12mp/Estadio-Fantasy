"use client";

import { useAuth } from "@/context/auth-context";
import { getManagerByIdGoogle } from "@/lib/data";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.uid) return;

      try {
        const { manager } = await getManagerByIdGoogle(user.uid);

        if (manager?.esAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push("/"); // o /unauthorized
        }
      } catch (err) {
        console.error("Error al verificar admin:", err);
        router.push("/login");
      }
    };

    if (!loading && user) {
      checkAdmin();
    }
  }, [user, loading, router]);

  if (loading || isAdmin === null) {
    return <p>Cargando permisos...</p>;
  }

  return <>{children}</>;
}
