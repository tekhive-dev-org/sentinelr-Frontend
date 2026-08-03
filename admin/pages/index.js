import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "../context/AuthContext";
import FullPageLoader from "../components/ui/FullPageLoader";
import { ADMIN_DEFAULT_REDIRECT, LOGIN_ROUTE } from "../constants/permissions";

export default function AdminIndex() {
  const router = useRouter();
  const { adminUser, isLoading, isSessionVerified } = useAdminAuth();

  useEffect(() => {
    if (isLoading || !router.isReady) return;

    if (adminUser && isSessionVerified) {
      router.replace(ADMIN_DEFAULT_REDIRECT);
    } else {
      router.replace(LOGIN_ROUTE);
    }
  }, [adminUser, isLoading, isSessionVerified, router]);

  return <FullPageLoader message="Loading Sentinelr Admin…" />;
}
