"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) router.push("/miequipo"); // Redirect if not authenticated
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // Show loading state while session is being fetched
  }

  return <>{session ? children : null}</>;
};

export default RequireAuth;
