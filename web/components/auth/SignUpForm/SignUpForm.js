import React from "react";
import Link from "next/link";
import Image from "next/image";
import Toast from "../../common/Toast";
import styles from "./SignUpForm.module.css";
import { useSignUp } from "./hooks/useSignUp";

export default function SignUpForm() {
  const {
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
  } = useSignUp();

  return (
    <div className={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Left Section (Lock Image) */}
      <div className={styles.leftSection}>
        <div className={styles.lockImageWrapper}>
          <Image
            src="/assets/images/lock.svg"
            alt="Security"
            fill
            className={styles.authImage}
            priority
          />
        </div>
      </div>
      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <div className={styles.logoWrapper}>
            <Image src="/logo.png" alt="Sentinelr" width={80} height={80} className={styles.logo} />
          </div>
          <h1 className={styles.title}>Create Account</h1>

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <div className={styles.formField}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                name="userName"
                className={`${styles.input} ${
                  formik.touched.userName && formik.errors.userName
                    ? styles.inputError
                    : ""
                }`}
                placeholder=""
                value={formik.values.userName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.userName && formik.errors.userName && (
                <div className={styles.errorText}>
                  {formik.errors.userName}
                </div>
              )}
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                className={`${styles.input} ${
                  formik.touched.email && formik.errors.email
                    ? styles.inputError
                    : ""
                }`}
                placeholder=""
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`${styles.input} ${
                    formik.touched.password && formik.errors.password
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder=""
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePasswordButton}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`${styles.input} ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder=""
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <div className={styles.errorText}>
                      {formik.errors.confirmPassword}
                    </div>
                  )}
              </div>
            </div>
            {formik.values.password && (
              <div className={styles.passwordStrengthContainer}>
                {/* Password Strength Bars */}
                <div className={styles.passwordStrengthBars}>
                  <div
                    className={`${styles.strengthBar} ${strength === "weak" ? styles.strengthBarWeak : strength === "moderate" ? styles.strengthBarModerate : strength === "strong" ? styles.strengthBarStrong : ""}`}
                  ></div>
                  <div
                    className={`${styles.strengthBar} ${strength === "moderate" ? styles.strengthBarModerate : strength === "strong" ? styles.strengthBarStrong : ""}`}
                  ></div>
                  <div
                    className={`${styles.strengthBar} ${strength === "strong" ? styles.strengthBarStrong : ""}`}
                  ></div>
                </div>

                {/* Password Strength Text and Checklist */}
                {strength === "weak" && (
                  <>
                    <p
                      className={`${styles.passwordStrengthText} ${styles.weakText}`}
                    >
                      Weak password. Must contain at least;
                    </p>
                    <div className={styles.passwordChecklist}>
                      {passwordChecks.map((check) => (
                        <div
                          key={check.label}
                          className={`${styles.checklistItem} ${
                            check.check(formik.values.password)
                              ? styles.checklistItemValid
                              : styles.checklistItemInvalid
                          }`}
                        >
                          {check.check(formik.values.password) ? (
                            <svg
                              className={styles.checklistIcon}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className={styles.checklistIcon}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {strength === "moderate" && (
                  <>
                    <p
                      className={`${styles.passwordStrengthText} ${styles.moderateText}`}
                    >
                      Moderate password. Must contain at least;
                    </p>
                    <div className={styles.passwordChecklist}>
                      {passwordChecks.map((check) => (
                        <div
                          key={check.label}
                          className={`${styles.checklistItem} ${
                            check.check(formik.values.password)
                              ? styles.checklistItemValid
                              : styles.checklistItemInvalid
                          }`}
                        >
                          {check.check(formik.values.password) ? (
                            <svg
                              className={styles.checklistIcon}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className={styles.checklistIcon}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {strength === "strong" && (
                  <>
                    <p
                      className={`${styles.passwordStrengthText} ${styles.strongText}`}
                    >
                      Strong password. Your password is secure.
                    </p>
                    <div className={styles.passwordChecklist}>
                      {passwordChecks.map((check) => (
                        <div
                          key={check.label}
                          className={`${styles.checklistItem} ${styles.checklistItemValid}`}
                        >
                          <svg
                            className={styles.checklistIcon}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="agree"
                checked={formik.values.agree}
                onChange={formik.handleChange}
                id="terms"
                className={styles.checkbox}
              />
              <label htmlFor="terms" className={styles.checkboxLabel}>
                I agree to the{" "}
                <Link href="#" className={styles.termsLink}>
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className={styles.termsLink}>
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={
                !formik.values.email ||
                !formik.values.userName ||
                !allValid ||
                !formik.values.agree ||
                !formik.values.confirmPassword ||
                loading
              }
              className={`${styles.submitButton} ${
                !formik.values.email ||
                !formik.values.userName ||
                !allValid ||
                !formik.values.agree ||
                !formik.values.confirmPassword ||
                loading
                  ? styles.submitButtonDisabled
                  : styles.submitButtonEnabled
              }`}
            >
              {loading ? "Signing Up..." : "Get Started"}
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.dividerLine}></div>
          </div>

          <p className={styles.subtitle}>
            Already have an account?{" "}
            <Link href="/login" className={styles.loginLink}>
              Log in
            </Link>
          </p>

          {/* Social Login Buttons */}
          <button className={styles.socialButton} type="button" onClick={loginWithGoogle}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#3d09d0"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#e6ae12"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#e6ae12"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#dc323f"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
