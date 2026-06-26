import * as Yup from "yup";

export const passwordChecks = [
  { label: "At least 1 uppercase", check: (v) => /[A-Z]/.test(v) },
  { label: "At least 1 number", check: (v) => /[0-9]/.test(v) },
  { label: "At least 1 special character", check: (v) => /[^A-Za-z0-9]/.test(v) },
  { label: "At least 8 characters", check: (v) => v.length >= 8 },
];

export const validationSchema = Yup.object({
  userName: Yup.string().required("Username is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .matches(/[A-Z]/, "At least 1 uppercase")
    .matches(/[0-9]/, "At least 1 number")
    .matches(/[^A-Za-z0-9]/, "At least 1 special character")
    .min(8, "At least 8 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  agree: Yup.boolean().oneOf([true], "You must accept the terms"),
});

export const getPasswordStrength = (password) => {
  const checks = passwordChecks.map((c) => c.check(password));
  const passed = checks.filter(Boolean).length;
  if (passed === 0) return "none";
  if (passed <= 2) return "weak";
  if (passed === 3) return "moderate";
  if (passed === 4) return "strong";
  return "none";
};
