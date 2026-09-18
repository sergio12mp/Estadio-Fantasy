import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  /** Quita el padding lateral (útil para páginas full-width) */
  noPadding?: boolean;
  /** Centra el contenido con max-width */
  centered?: boolean;
}

export default function PageLayout({
  children,
  className,
  noPadding = false,
  centered = false,
}: PageLayoutProps) {
  return (
    <main
      className={cn(
        "min-h-screen pt-[60px] pb-16 md:pb-0",
        !noPadding && "px-4",
        centered && "max-w-5xl mx-auto",
        className
      )}
    >
      {children}
    </main>
  );
}
