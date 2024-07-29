import { GetManagerByEmail, CreateManager } from "@/database/manager";
import { NavbarHome } from "./navbar";
import { NavbarLite } from "./navbarLite";
import { getServerSession } from "next-auth";

export async function SelectNavbar() {
  const session = await getServerSession();
  const sessionUser = session?.user;

  if (sessionUser) {
    if (!sessionUser.email || !sessionUser.name) {
      return <h1>Error fetching user info from session.</h1>;
    }

    const manager = await GetManagerByEmail(sessionUser.email);

    let userID;

    if (!manager) {
      const newManagerInfo = await CreateManager({
        name: sessionUser.name,
        email: sessionUser.email,
        idGoogle: sessionUser.id
      });

      userID = newManagerInfo.id;
    } else {
      userID = manager.idManager;
    }

    return <NavbarHome userID={userID}></NavbarHome>;
  } else {
    return <NavbarLite></NavbarLite>;
  }
}
