import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import styles from './ForgotPassword.module.css';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [successMessage, setSuccessMessage] = React.useState('');

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema,
    onSubmit: async (values) => {
      setSuccessMessage('');
      const result = await forgotPassword(values.email);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Password reset link sent to your email.');
      } else {
        formik.setFieldError('email', result.error || 'Failed to send reset link');
      }
    },
  });

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <h1 className={styles.title}>Forgot Password?</h1>
          <p className={styles.subtitle}>
            No worries, we'll send you reset instructions
          </p>

          {successMessage && (
            <div style={{ color: 'green', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className={styles.form}>
            <div className={styles.formField}>
              <label className={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`${styles.input} ${
                  formik.touched.email && formik.errors.email ? styles.inputError : ''
                }`}
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className={styles.errorText}>
                  {formik.errors.email}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`${styles.submitButton} ${
                formik.isSubmitting ? styles.submitButtonDisabled : styles.submitButtonEnabled
              }`}
            >
              {formik.isSubmitting ? 'Sending...' : 'Reset Password'}
            </button>
          </form>

          {/* Back to Login */}
          <div className={styles.backToLogin}>
            <Link href="/login" className={styles.backLink}>
              <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
