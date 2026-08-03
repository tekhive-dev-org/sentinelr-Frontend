import React from "react";
import Image from "next/image";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useAdminLogin } from "../../../hooks/useAdminLogin";
import { LOGIN_CONSTANTS } from "./AdminLoginForm.constants";
import styles from "./AdminLoginForm.module.css";

export default function AdminLoginForm() {
  const {
    values,
    errors,
    touched,
    showPassword,
    formError,
    isSubmitting,
    loginSuccess,
    handleChange,
    handleBlur,
    togglePassword,
    handleSubmit,
  } = useAdminLogin();

  return (
    <div className={styles.container}>
      {/* Login Success Loading Screen Overlay */}
      {loginSuccess && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner} />
            <h2 className={styles.loadingTitle}>{LOGIN_CONSTANTS.SUCCESS_TITLE}</h2>
            <p className={styles.loadingSubtitle}>{LOGIN_CONSTANTS.SUCCESS_SUBTITLE}</p>
          </div>
        </div>
      )}

      {/* Login Form Card */}
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <Image
            src="/logo.png"
            alt="Sentinelr Logo"
            width={220}
            height={60}
            className={styles.loginLogo}
            priority
          />
        </div>

        <h1 className={styles.title}>{LOGIN_CONSTANTS.TITLE}</h1>
        <p className={styles.subtitle}>{LOGIN_CONSTANTS.SUBTITLE}</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className={styles.field}>
            <label htmlFor="admin-email" className={styles.label}>
              {LOGIN_CONSTANTS.EMAIL_LABEL}
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="admin-email"
                type="email"
                name="email"
                className={`${styles.input} ${
                  touched.email && errors.email ? styles.inputError : ""
                }`}
                placeholder={LOGIN_CONSTANTS.EMAIL_PLACEHOLDER}
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                required
                autoComplete="email"
              />
            </div>
            {touched.email && errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>
              {LOGIN_CONSTANTS.PASSWORD_LABEL}
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                className={`${styles.input} ${
                  touched.password && errors.password ? styles.inputError : ""
                }`}
                placeholder={LOGIN_CONSTANTS.PASSWORD_PLACEHOLDER}
                value={values.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon style={{ fontSize: 18 }} />
                ) : (
                  <VisibilityOutlinedIcon style={{ fontSize: 18 }} />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          {/* Form-level Error Notification */}
          {formError && (
            <div className={styles.formError} role="alert">
              <ErrorOutlineIcon className={styles.formErrorIcon} />
              <span>{formError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || loginSuccess}
          >
            {isSubmitting
              ? LOGIN_CONSTANTS.SUBMIT_BUTTON_LOADING
              : LOGIN_CONSTANTS.SUBMIT_BUTTON_IDLE}
          </button>
        </form>

      
      </div>
    </div>
  );
}
