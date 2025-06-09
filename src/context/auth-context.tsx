"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Manager, getManagerByIdGoogle } from "@/lib/data";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  manager: Manager | null;
  setManager: (m: Manager) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  manager: null,
  setManager: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      console.log("🔥 Firebase user", firebaseUser);
  
      if (firebaseUser?.uid) {
        try {
          const response = await getManagerByIdGoogle(firebaseUser.uid);
          console.log("🎯 Manager obtenido:", response);
          setManager(response.manager); // asegúrate que existe
        } catch (err) {
          console.error("❌ Error al obtener el manager:", err);
          setManager(null);
        }
      } else {
        setManager(null);
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading, manager, setManager }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
