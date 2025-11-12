import React, { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import Image from 'next/image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const passwordChecks = [
  { label: 'At least 1 uppercase', check: (v) => /[A-Z]/.test(v) },
  { label: 'At least 1 lowercase', check: (v) => /[a-z]/.test(v) },
  { label: 'At least 1 number', check: (v) => /\d/.test(v) },
  { label: 'At least 8 characters', check: (v) => v.length >= 8 },
];

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .matches(/[A-Z]/, 'At least 1 uppercase')
    .matches(/[a-z]/, 'At least 1 lowercase')
    .matches(/\d/, 'At least 1 number')
    .min(8, 'At least 8 characters'),
  agree: Yup.boolean().oneOf([true], 'You must accept the terms'),
});

const getPasswordStrength = (password) => {
  const checks = passwordChecks.map((c) => c.check(password));
  const passed = checks.filter(Boolean).length;
  if (passed <= 2) return 'weak';
  if (passed === 3) return 'moderate';
  if (passed === 4) return 'strong';
  return 'weak';
};

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const formik = useFormik({
    initialValues: { email: '', password: '', agree: false },
    validationSchema,
    onSubmit: (values) => {
      // handle sign up logic here
      console.log(values);
    },
  });

  const [showStrong, setShowStrong] = useState(false);
  const strength = getPasswordStrength(formik.values.password);
  const prevStrength = useRef(strength);

  useEffect(() => {
    if (strength === 'strong' && prevStrength.current !== 'strong') {
      setShowStrong(true);
      const timer = setTimeout(() => setShowStrong(false), 2000);
      return () => clearTimeout(timer);
    }
    prevStrength.current = strength;
  }, [strength]);

  const allValid = passwordChecks.every((c) => c.check(formik.values.password));

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-auto">
      {/* Left Background Section (desktop only) */}
      <div className="hidden md:block fixed rounded-r-3xl top-0 left-0 h-screen w-1/2 bg-[#4A4742] -z-10"></div>

      {/* Left Section (Lock Image) */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-[#4A4742] md:bg-transparent py-12 md:py-0">
        <div className="w-3/4 max-w-md relative h-64 md:h-96">
          <Image
            src="/assets/images/lock.svg" 
            alt="Security"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center px-6 py-10">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Sign up to XYZ Security App
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>
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

          <div className="flex items-center mb-4">
            <hr className="grow border-gray-300" />
            <span className="px-2 text-gray-400 text-sm">OR</span>
            <hr className="grow border-gray-300" />
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
                className={`w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : 'border-gray-300'
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </button>
              </div>
              {formik.touched.password && (
                <div className="mt-2 text-xs">
                  {strength === 'weak' && (
                    <>
                      <span className="text-red-600 font-medium">
                        Weak password. Must contain at least:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {passwordChecks.map((c) => (
                          <li
                            key={c.label}
                            className={
                              c.check(formik.values.password)
                                ? 'text-green-600 flex items-center gap-1'
                                : 'text-gray-400 flex items-center gap-1'
                            }
                          >
                            <span>
                              {c.check(formik.values.password) ? (
                                <CheckCircleIcon sx={{ fontSize: 14 }} />
                              ) : (
                                <RadioButtonUncheckedIcon sx={{ fontSize: 14 }} />
                              )}
                            </span>
                            {c.label}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {strength === 'moderate' && (
                    <>
                      <span className="text-orange-600 font-medium">
                        Moderate password. Must contain at least:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {passwordChecks.map((c) => (
                          <li
                            key={c.label}
                            className={
                              c.check(formik.values.password)
                                ? 'text-green-600 flex items-center gap-1'
                                : 'text-gray-400 flex items-center gap-1'
                            }
                          >
                            <span>
                              {c.check(formik.values.password) ? (
                                <CheckCircleIcon sx={{ fontSize: 14 }} />
                              ) : (
                                <RadioButtonUncheckedIcon sx={{ fontSize: 14 }} />
                              )}
                            </span>
                            {c.label}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {strength === 'strong' && showStrong && (
                    <span className="text-green-600 font-medium">
                      Strong password. Your password is secure.
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="agree"
                checked={formik.values.agree}
                onChange={formik.handleChange}
                id="terms"
                className="accent-blue-600"
              />
              <label htmlFor="terms" className="text-sm">
                I agree to the{' '}
                <Link href="#" className="text-blue-600 hover:underline">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {formik.touched.agree && formik.errors.agree && (
              <div className="text-red-500 text-xs mt-1 text-left">
                {formik.errors.agree}
              </div>
            )}
            <button
              type="submit"
              disabled={
                !formik.values.email ||
                !allValid ||
                !formik.values.agree ||
                !!formik.errors.email ||
                !!formik.errors.password ||
                !!formik.errors.agree
              }
              className={`w-full bg-[#0E4B68] text-white py-2 rounded-lg transition ${
                !formik.values.email ||
                !allValid ||
                !formik.values.agree ||
                !!formik.errors.email ||
                !!formik.errors.password ||
                !!formik.errors.agree
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#1769a3]'
              }`}
            >
              Get Started
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
