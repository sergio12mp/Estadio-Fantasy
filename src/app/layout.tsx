import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { SelectNavbar } from "@/components/selectNavbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Aplica el tema oscuro antes del primer render para evitar parpadeo */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <SessionProviderWrapper>
          <AuthProvider>
            <SelectNavbar />
            {children}
          </AuthProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
