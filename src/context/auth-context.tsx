"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { Manager } from "@/lib/data";

type SimpleUser = {
  name: string | null;
  email: string | null;
  image: string | null;
};

type AuthContextType = {
  user: SimpleUser | null;
  loading: boolean;
  manager: Manager | null;
  setManager: (m: Manager) => void;
  currency: { oro: number; balones: number };
  setCurrency: (c: { oro: number; balones: number }) => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  manager: null,
  setManager: () => {},
  currency: { oro: 0, balones: 0 },
  setCurrency: () => {},
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [manager, setManager] = useState<Manager | null>(null);
  const [currency, setCurrency] = useState({ oro: 0, balones: 0 });

  const loading = status === "loading";
  const isAdmin = session?.user?.esAdmin === true;
  const user: SimpleUser | null = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : null;

  useEffect(() => {
    const managerId = session?.user?.managerId;
    if (!managerId) {
      setManager(null);
      setCurrency({ oro: 0, balones: 0 });
      return;
    }

    // Construir el manager desde los datos de sesión + idManager del token
    setManager({
      idManager: managerId,
      nombre: session.user.name ?? "",
      email: session.user.email ?? "",
      idGoogle: "",
      oro: 0,
      balones: 0,
    });

    // Cargar economía actual desde DB
    fetch(`/api/manager/economia/${managerId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCurrency({ oro: data.oro, balones: data.balones });
          setManager((prev) =>
            prev
              ? { ...prev, oro: data.oro, balones: data.balones, puntuacion_actual: data.puntuacion_actual ?? 0 }
              : prev
          );
        }
      })
      .catch((e) => console.error("Error cargando economía:", e));
  }, [session]);

  return (
    <AuthContext.Provider
      value={{ user, loading, manager, setManager, currency, setCurrency, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
