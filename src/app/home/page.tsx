"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) router.push("/"); // Redirect if not authenticated
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // Show loading state while session is being fetched
  }

  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      <p>User: {session?.user?.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
      {/* Rest of your page content */}
    </div>
  );
};

export default Home;
