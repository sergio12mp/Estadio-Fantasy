"use client";

import { signIn } from "next-auth/react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const FEATURES = [
  {
    icon: "📦",
    title: "Abre Sobres",
    desc: "Colecciona cartas de jugadores y objetos con sistema de rareza y pity garantizado.",
  },
  {
    icon: "🧑‍🤝‍🧑",
    title: "Arma tu Equipo",
    desc: "Selecciona tu alineación cada jornada y equipa objetos para maximizar tus puntos.",
  },
  {
    icon: "🏆",
    title: "Compite en Ligas",
    desc: "Enfréntate a otros managers en ligas privadas o de club con bonificaciones especiales.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4 pt-[60px] min-h-screen"
        style={{
          backgroundImage: "url('/estadioFantasy.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gray-950/70" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
            Estadio Fantasy
          </h1>
          <p className="text-xl sm:text-2xl text-blue-200 font-medium mb-10">
            Donde tus alineaciones se hacen realidad
          </p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/home" })}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl transition-colors"
          >
            Empezar con Google
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-white">¿Cómo funciona?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-gray-800 rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-lg"
              >
                <span className="text-4xl">{icon}</span>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Estadio Fantasy — TFG
      </footer>
    </div>
  );
}
