import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { SelectNavbar } from "@/components/layout/selectNavbar";
import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";
import BottomNav from "@/components/layout/BottomNav";
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background text-foreground transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProviderWrapper>
            <AuthProvider>
              <SelectNavbar />
              {children}
              <BottomNav />
            </AuthProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
