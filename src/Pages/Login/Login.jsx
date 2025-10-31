import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../context/AuthContext";
import lock from "../../assets/Images/lock.svg";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginPage = () => {
  const { user, login, logout, loading } = useAuth();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      await login(values.email, values.password);
    },
  });

  // Show welcome screen after login
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50">
        <h2 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h2>
        <p className="text-gray-600 mb-4">{user.email}</p>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-auto md:fixed md:inset-0 md:h-screen md:w-screen md:overflow-hidden">
      {/* Left Background Section (desktop only) */}
      <div className="hidden md:block fixed rounded-r-3xl top-0 left-0 h-screen w-1/2 bg-[#4A4742] -z-10"></div>

      {/* Left Section (Lock Image) */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-[#4A4742] md:bg-transparent py-12 md:py-0">
        <img src={lock} alt="Security" className="w-2/3 max-w-md object-contain" />
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Login to your account
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Don’t have an account?{" "}
            <a href="#" className="text-green-600 font-medium hover:underline">
              Sign up
            </a>
          </p>

          {/* Continue with buttons */}
          <button className="w-full border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 mb-3 hover:bg-gray-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button className="w-full border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 mb-4 hover:bg-gray-50">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Continue with Apple
          </button>

          {/* Divider */}
          <div className="flex items-center mb-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-400 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={formik.handleSubmit}>
            <div>
              <label className="text-sm font-medium text-left block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`w-full mt-1 p-2 border rounded-lg focus:ring-1 focus:ring-[#0E4B68] outline-none ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-xs mt-1 text-left">
                  {formik.errors.email}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-left block">
                Password
              </label>
              <input
                type="password"
                name="password"
                className={`w-full mt-1 p-2 border rounded-lg focus:ring-1 focus:ring-[#0E4B68] outline-none ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-xs mt-1 text-left">
                  {formik.errors.password}
                </div>
              )}
              <div className="flex justify-end mt-1">
                <a
                  href="#"
                  className="text-sm text-green-600 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2 rounded-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0E4B68] hover:bg-blue-800"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
