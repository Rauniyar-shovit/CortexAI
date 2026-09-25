import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import getCurrentUser from "../features/getCurrentUser";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

function ProtectedRoute() {
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser();
      user ? setStatus("authenticated") : setStatus("unauthenticated");

      console.log(user);
    };
    getUser();
  }, []);

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
