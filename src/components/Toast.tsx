"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, type = "info", onDismiss, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-[100] ${colors[type]} text-white px-5 py-3 rounded-xl shadow-xl
        flex items-center gap-3 text-sm font-medium max-w-sm`}
    >
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-white/70 hover:text-white shrink-0 text-lg leading-none">
        ✕
      </button>
    </div>
  );
}
