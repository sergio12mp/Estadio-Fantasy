import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { SelectNavbar } from "@/components/selectNavbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <SelectNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

