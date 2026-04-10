//withNavBar/layout.tsx
//import "bootstrap/dist/css/bootstrap.min.css";
import { Providers } from "@/components/layout/providers";
import { SelectNavbar } from "@/components/layout/selectNavbar";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>
    
    <Providers>
      <SelectNavbar></SelectNavbar>
      {children}
    </Providers>
    </>;
}