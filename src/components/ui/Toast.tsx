"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
  duration?: number;
}

const COLORS = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

const ICONS = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export default function Toast({
  message,
  type = "info",
  onDismiss,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed z-[100] right-4 text-white px-4 py-3 rounded-xl shadow-xl",
        "flex items-center gap-3 text-sm font-medium max-w-sm w-[calc(100%-2rem)]",
        /* Encima del bottom nav en móvil, pegado a la derecha en desktop */
        "bottom-20 md:bottom-5 md:right-5 md:w-auto",
        "animate-slide-up",
        COLORS[type]
      )}
    >
      <span aria-hidden="true" className="text-base shrink-0">{ICONS[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="text-white/70 hover:text-white shrink-0"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
