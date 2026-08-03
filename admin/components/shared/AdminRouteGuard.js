import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LOGIN_ROUTE } from "../../constants/permissions";
import useAuthorization from "../../hooks/useAuthorization";
import FullPageLoader from "../ui/FullPageLoader";
import UnauthorizedState from "./UnauthorizedState";

export default function AdminRouteGuard({
  children,
  permissions = [],
  requireAll = true,
  unauthorizedBehavior = "redirect",
  unauthorizedRedirect,
  loadingMessage = "Verifying admin access…",
}) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const {
    isLoading,
    isAuthenticated,
    isSessionVerified,
    isAuthorized,
    sessionError,
    retrySessionVerification,
  } = useAuthorization({ permissions, requireAll });

  const redirectTo = unauthorizedRedirect || "/dashboard";

  useEffect(() => {
    if (isLoading || !router.isReady) return;

    if (!isAuthenticated) {
      router.replace({
        pathname: LOGIN_ROUTE,
        query: { returnTo: router.asPath },
      });
      return;
    }

    if (
      isSessionVerified &&
      !isAuthorized &&
      unauthorizedBehavior === "redirect" &&
      router.asPath !== redirectTo
    ) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isAuthorized, isLoading, isSessionVerified, router, unauthorizedBehavior, redirectTo]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retrySessionVerification();
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading || !router.isReady || !isAuthenticated) {
    return <FullPageLoader message={loadingMessage} />;
  }

  if (!isSessionVerified) {
    return (
      <UnauthorizedState
        title="We could not verify your admin session"
        message={sessionError || "Admin access stays locked until Sentinelr verifies your session."}
        actionLabel="Return to dashboard"
        onAction={() => router.replace("/dashboard")}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (!isAuthorized) {
    if (unauthorizedBehavior === "render" || router.asPath === redirectTo) {
      return (
        <UnauthorizedState
          onAction={() => router.replace(redirectTo)}
        />
      );
    }
    return <FullPageLoader message="Redirecting to your dashboard…" />;
  }

  return children;
}
