import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "../context/AuthContext";
import FullPageLoader from "../components/ui/FullPageLoader";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const { adminUser, isLoading: authLoading, isSessionVerified, login, sessionError } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && adminUser && isSessionVerified) {
      const returnTo = router.query.returnTo;
      router.replace(returnTo && typeof returnTo === "string" && returnTo.startsWith("/") ? returnTo : "/dashboard");
    }
  }, [authLoading, adminUser, isSessionVerified, router]);

  if (authLoading) {
    return <FullPageLoader message="Checking existing session…" />;
  }

  if (adminUser && isSessionVerified) {
    return <FullPageLoader message="Redirecting to dashboard…" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Sentinelr Admin</h1>
        <p className={styles.subtitle}>Sign in to your admin account</p>

        {error || sessionError ? (
          <div className={styles.error} role="alert">{error || sessionError}</div>
        ) : null}

        <div className={styles.field}>
          <label htmlFor="admin-email" className={styles.label}>Email</label>
          <input
            id="admin-email"
            type="email"
            className={styles.input}
            placeholder="admin@sentinelr.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="admin-password" className={styles.label}>Password</label>
          <input
            id="admin-password"
            type="password"
            className={styles.input}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <a href={process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:4000"} className={styles.backLink}>
          Return to Sentinelr
        </a>
      </form>
    </main>
  );
}
