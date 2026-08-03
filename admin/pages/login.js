import React from "react";
import AdminLoginForm from "../components/auth/AdminLoginForm/AdminLoginForm";
import FullPageLoader from "../components/ui/FullPageLoader";
import { useAdminAuth } from "../context/AuthContext";

export default function Login() {
  const { adminUser, isLoading: authLoading, isSessionVerified } = useAdminAuth();

  if (authLoading) {
    return <FullPageLoader message="Checking existing session…" />;
  }

  if (adminUser && isSessionVerified) {
    return <FullPageLoader message="Redirecting to dashboard…" />;
  }

  return <AdminLoginForm />;
}
