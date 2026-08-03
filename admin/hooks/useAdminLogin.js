import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "../context/AuthContext";
import { validateLoginForm } from "../components/auth/AdminLoginForm/AdminLoginForm.validation";
import { LOGIN_CONSTANTS } from "../components/auth/AdminLoginForm/AdminLoginForm.constants";

export function useAdminLogin() {
  const router = useRouter();
  const { adminUser, isLoading: authLoading, isSessionVerified, login, sessionError } = useAdminAuth();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Auto redirect if session is already active
  useEffect(() => {
    if (!authLoading && adminUser && isSessionVerified) {
      const returnTo = router.query.returnTo;
      const targetPath =
        returnTo && typeof returnTo === "string" && returnTo.startsWith("/")
          ? returnTo
          : LOGIN_CONSTANTS.DEFAULT_RETURN_PATH;
      router.replace(targetPath);
    }
  }, [authLoading, adminUser, isSessionVerified, router]);

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFormError("");
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const handleBlur = useCallback(
    (field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const validationErrors = validateLoginForm(values);
      if (validationErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: validationErrors[field] }));
      }
    },
    [values]
  );

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setFormError("");
      setTouched({ email: true, password: true });

      const validationErrors = validateLoginForm(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await login(values.email, values.password);
        if (result.success) {
          setLoginSuccess(true);
          const returnTo = router.query.returnTo;
          const targetPath =
            returnTo && typeof returnTo === "string" && returnTo.startsWith("/")
              ? returnTo
              : LOGIN_CONSTANTS.DEFAULT_RETURN_PATH;

          setTimeout(() => {
            router.replace(targetPath);
          }, 1200);
        } else {
          setFormError(result.error || "Login failed. Please check your admin credentials.");
        }
      } catch (err) {
        setFormError(err.message || "An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, login, router]
  );

  return {
    values,
    errors,
    touched,
    showPassword,
    formError: formError || sessionError,
    isSubmitting,
    loginSuccess,
    authLoading,
    adminUser,
    isSessionVerified,
    handleChange,
    handleBlur,
    togglePassword,
    handleSubmit,
  };
}
