// src/components/NavBarWrapper.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NavBar from "./navbar";

export default async function NavBarWrapper() {
  const session = await getServerSession(authOptions);

  return <NavBar session={session} />;
}
