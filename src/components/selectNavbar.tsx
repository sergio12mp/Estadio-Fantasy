// app/dashboard/selectNavbar.tsx

"use client";

import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import NavBar from "./navbar";
import { NavbarLite } from "./navbarLite";

export function SelectNavbar() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncManager = async () => {
      console.log("DEBUG: User object from useAuth:", user); // Para reconfirmar que user está llegando bien

      if (!user?.uid || !user.displayName || !user.email) {
        setReady(true);
        return;
      }

      try {
        console.log("DEBUG: Intentando verificar manager con idGoogle:", user.uid);
        // Buscar por idGoogle
        const res = await fetch(`/api/manager?idGoogle=${user.uid}`);
        console.log("DEBUG: GET /api/manager response status:", res.status);

        if (res.status === 404) {
          console.log("DEBUG: Manager no encontrado (GET 404). Procediendo a crear...");
          // Crear si no existe
          const createRes = await fetch("/api/manager", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: user.displayName,
              email: user.email,
              idGoogle: user.uid,
            }),
          });

          // *** ESTO ES CRUCIAL: Leer la respuesta del POST ***
          const createResData = await createRes.json();
          console.log("DEBUG: POST /api/manager response status:", createRes.status);
          console.log("DEBUG: POST /api/manager response data:", createResData);

          if (!createRes.ok) { // Si el status no es 2xx (por ejemplo, 400 o 500)
              console.error("ERROR FRONTEND: La creación del manager falló con estado:", createRes.status, "Datos:", createResData);
          } else {
              console.log("INFO FRONTEND: Manager creado exitosamente. ID:", createResData.id);
          }

        } else if (res.status === 200) {
            const managerData = await res.json();
            console.log("INFO FRONTEND: Manager ya existe:", managerData.manager);
        } else {
            console.error("ERROR FRONTEND: Respuesta inesperada de GET /api/manager:", res.status, await res.json());
        }

      } catch (err) {
        console.error("❌ Error sincronizando manager (catch global):", err);
      } finally {
        setReady(true);
      }
    };

    syncManager();
  }, [user]);

  if (!ready) return <p>Cargando...</p>;

  return user ? <NavBar /> : <NavbarLite />;
}