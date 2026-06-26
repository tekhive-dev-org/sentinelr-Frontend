import { useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useAuth } from "../../../../context/AuthContext";
import { validationSchema, getPasswordStrength, passwordChecks } from "../utils/signUpHelpers";

export function useSignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const { signup, loading, loginWithGoogle } = useAuth();

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agree: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await signup(
        values.userName,
        values.email,
        values.password,
        values.confirmPassword,
        values.role,
      );

      if (result.success) {
        router.push(`/verify?email=${encodeURIComponent(values.email)}`);
      } else {
        const errorMsg = result.error
          ? result.error.replace("Error: ", "")
          : "Signup failed";
        setToast({ message: errorMsg, type: "error" });
        formik.setFieldError("email", errorMsg);
      }
    },
  });

  const strength = getPasswordStrength(formik.values.password);
  const allValid = passwordChecks.every((c) => c.check(formik.values.password));

  return {
    formik,
    showPassword,
    setShowPassword,
    toast,
    setToast,
    loading,
    loginWithGoogle,
    strength,
    allValid,
    passwordChecks,
  };
}
