import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';
import Image from 'next/image';
import styles from './ResetPassword.module.css';

const passwordChecks = [
  { label: 'At least 1 uppercase', check: (v) => /[A-Z]/.test(v) },
  { label: 'At least 1 number', check: (v) => /\d/.test(v) },
  { label: 'At least 8 characters', check: (v) => v.length >= 8 },
];

const validationSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .matches(/[A-Z]/, 'At least 1 uppercase')
    .matches(/\d/, 'At least 1 number')
    .min(8, 'At least 8 characters'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

const getPasswordStrength = (password) => {
  const checks = passwordChecks.map((c) => c.check(password));
  const passed = checks.filter(Boolean).length;
  if (passed === 0) return 'none';
  if (passed <= 1) return 'weak';
  if (passed === 2) return 'moderate';
  if (passed === 3) return 'strong';
  return 'none';
};

export default function ResetPassword() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values) => {
      // Handle reset password logic here
      console.log('Resetting password');
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Redirect to success page
      router.push('/login');
    },
  });

  const strength = getPasswordStrength(formik.values.password);
  const allValid = passwordChecks.every((c) => c.check(formik.values.password));

  return (
    <div className={styles.container}>
      {/* Left Section (Lock Image) */}
      <div className={styles.leftSection}>
        <div className={styles.lockImageWrapper}>
          <Image 
            src="/assets/images/lock.svg" 
            alt="Security" 
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          {/* Lock Icon */}
          <div className={styles.iconWrapper}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className={styles.title}>Set New Password</h1>
          <p className={styles.subtitle}>
            Your new password must be different from previously used passwords
          </p>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className={styles.form}>
            <div className={styles.formField}>
              <label className={styles.label}>
                New Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`${styles.input} ${
                    formik.touched.password && formik.errors.password ? styles.inputError : ''
                  }`}
                  placeholder="Enter new password"
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {formik.values.password && (
                <div className={styles.passwordStrengthContainer}>
                  <div className={styles.passwordStrengthBars}>
                    <div className={`${styles.strengthBar} ${strength === 'weak' ? styles.strengthBarWeak : strength === 'moderate' ? styles.strengthBarModerate : strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                    <div className={`${styles.strengthBar} ${strength === 'moderate' ? styles.strengthBarModerate : strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                    <div className={`${styles.strengthBar} ${strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                  </div>

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
                          <svg className={styles.checklistIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className={styles.checklistIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>
                Confirm Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`${styles.input} ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword ? styles.inputError : ''
                  }`}
                  placeholder="Confirm new password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.togglePasswordButton}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className={styles.errorText}>
                  {formik.errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!allValid || !formik.values.confirmPassword || formik.isSubmitting}
              className={`${styles.submitButton} ${
                !allValid || !formik.values.confirmPassword || formik.isSubmitting
                  ? styles.submitButtonDisabled
                  : styles.submitButtonEnabled
              }`}
            >
              {formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
