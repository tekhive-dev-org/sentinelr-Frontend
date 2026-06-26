import React, { useState } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Toast from '../../../common/Toast';
import SettingsService from './SettingsService';
import styles from './Settings.module.css';

const passwordChecks = [
  { label: 'At least 1 uppercase', check: (v) => /[A-Z]/.test(v) },
  { label: 'At least 1 number', check: (v) => /[0-9]/.test(v) },
  { label: 'At least 1 special character', check: (v) => /[^A-Za-z0-9]/.test(v) },
  { label: 'At least 8 characters', check: (v) => v.length >= 8 },
];

const getPasswordStrength = (password) => {
  const checks = passwordChecks.map((c) => c.check(password));
  const passed = checks.filter(Boolean).length;
  if (passed === 0) return 'none';
  if (passed <= 2) return 'weak';
  if (passed === 3) return 'moderate';
  if (passed === 4) return 'strong';
  return 'none';
};

export default function PasswordTab({ formik, apiError, onClearError, isSubmitting, onSubmit, onDiscard }) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOTP = async () => {
    setSendingOtp(true);
    try {
      await SettingsService.sendPasswordResetOTP(formik.values.email);
      setOtpSent(true);
      setToast({ message: 'OTP sent to your email', type: 'success' });
      if (onClearError) onClearError();
    } catch (error) {
      setToast({ message: error.message || 'Failed to send OTP', type: 'error' });
    } finally {
      setSendingOtp(false);
    }
  };

  const strength = getPasswordStrength(formik.values.newPassword);
  const allChecksValid = passwordChecks.every((c) => c.check(formik.values.newPassword));
  const passwordsMatch = formik.values.newPassword && formik.values.newPassword === formik.values.confirmPassword;
  const strengthLabel = strength === 'none' ? 'Not started' : strength;

  return (
    <div className={styles.section}>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <h3 className={styles.sectionTitle}>Password</h3>
      <p className={styles.sectionDescription}>Update your password to ensure your account remains private and secure.</p>

      <div className={styles.passwordFlow}>
        <div className={styles.passwordStepCard}>
          <div className={styles.passwordStepIcon}>
            <MarkEmailReadOutlinedIcon />
          </div>
          <div className={styles.passwordStepContent}>
            <div className={styles.passwordStepHeader}>
              <div>
                <span className={styles.passwordStepLabel}>Step 1</span>
                <h4>Verify your email</h4>
              </div>
              <span className={`${styles.passwordStepBadge} ${otpSent ? styles.passwordStepBadgeSuccess : ''}`}>
                {otpSent ? 'Code sent' : 'Required'}
              </span>
            </div>
            <p>We will send a one-time verification code before allowing password changes.</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                className={`${styles.input} ${(formik.touched.email && formik.errors.email) || apiError ? styles.inputError : ''}`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={otpSent}
              />
              {formik.touched.email && formik.errors.email && (
                <div className={styles.errorText}>
                  <ErrorOutlineIcon className={styles.errorIcon} />
                  {formik.errors.email}
                </div>
              )}
              {apiError && !otpSent && (
                <div className={styles.errorText}>
                  <ErrorOutlineIcon className={styles.errorIcon} />
                  {apiError}
                </div>
              )}
            </div>

            {!otpSent ? (
              <button
                type="button"
                className={`${styles.primaryButton} ${styles.otpButton}`}
                onClick={handleSendOTP}
                disabled={sendingOtp || !formik.values.email || (formik.touched.email && formik.errors.email)}
              >
                {sendingOtp ? 'Sending code...' : 'Send verification code'}
              </button>
            ) : (
              <div className={styles.otpSentNotice}>
                <ShieldOutlinedIcon />
                <span>Verification code sent. Check your inbox and continue below.</span>
              </div>
            )}
          </div>
        </div>

        {otpSent && (
          <div className={styles.passwordStepCard}>
            <div className={styles.passwordStepIcon}>
              <LockResetOutlinedIcon />
            </div>
            <div className={styles.passwordStepContent}>
              <div className={styles.passwordStepHeader}>
                <div>
                  <span className={styles.passwordStepLabel}>Step 2</span>
                  <h4>Create a new password</h4>
                </div>
                <span className={`${styles.passwordStepBadge} ${allChecksValid && passwordsMatch ? styles.passwordStepBadgeSuccess : ''}`}>
                  {allChecksValid && passwordsMatch ? 'Ready' : 'In progress'}
                </span>
              </div>
              <p>Enter the verification code and choose a password that satisfies every security requirement.</p>

              <div className={styles.passwordFieldsGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Verification Code</label>
                  <input
                    type="text"
                    name="otp"
                    className={`${styles.input} ${(formik.touched.otp && formik.errors.otp) ? styles.inputError : ''}`}
                    value={formik.values.otp || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter code"
                  />
                  {formik.touched.otp && formik.errors.otp && (
                    <div className={styles.errorText}>
                      <ErrorOutlineIcon className={styles.errorIcon} />
                      {formik.errors.otp}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>New Password</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      className={`${styles.input} ${formik.touched.newPassword && formik.errors.newPassword ? styles.inputError : ''}`}
                      value={formik.values.newPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter new password"
                    />
                    <button 
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showNewPassword ? (
                        <VisibilityOffOutlinedIcon className={styles.passwordIcon} />
                      ) : (
                        <VisibilityOutlinedIcon className={styles.passwordIcon} />
                      )}
                    </button>
                  </div>
                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <div className={styles.errorText}>
                      <ErrorOutlineIcon className={styles.errorIcon} />
                      {formik.errors.newPassword}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirm New Password</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className={`${styles.input} ${formik.touched.confirmPassword && formik.errors.confirmPassword ? styles.inputError : ''}`}
                      value={formik.values.confirmPassword || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Confirm new password"
                    />
                    <button 
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffOutlinedIcon className={styles.passwordIcon} />
                      ) : (
                        <VisibilityOutlinedIcon className={styles.passwordIcon} />
                      )}
                    </button>
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <div className={styles.errorText}>
                      <ErrorOutlineIcon className={styles.errorIcon} />
                      {formik.errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.passwordStrengthPanel}>
                <div className={styles.passwordStrengthHeader}>
                  <span>Password strength</span>
                  <strong className={styles[`strengthLabel_${strength}`]}>{strengthLabel}</strong>
                </div>
                <div className={styles.passwordStrengthBars} aria-hidden="true">
                  <div className={`${styles.strengthBar} ${strength === 'weak' ? styles.strengthBarWeak : strength === 'moderate' ? styles.strengthBarModerate : strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                  <div className={`${styles.strengthBar} ${strength === 'moderate' ? styles.strengthBarModerate : strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                  <div className={`${styles.strengthBar} ${strength === 'moderate' ? styles.strengthBarModerate : strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                  <div className={`${styles.strengthBar} ${strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                </div>
                <div className={styles.passwordChecklist}>
                  {passwordChecks.map((check) => {
                    const isValid = check.check(formik.values.newPassword);
                    return (
                      <div
                        key={check.label}
                        className={`${styles.checklistItem} ${
                          isValid ? styles.checklistItemValid : styles.checklistItemInvalid
                        }`}
                      >
                        {isValid ? (
                          <svg className={styles.checklistIcon} fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className={styles.checklistIcon} fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 12z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span>{check.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {apiError && (
                <div className={`${styles.errorText} ${styles.errorTextSpaced}`}>
                  <ErrorOutlineIcon className={styles.errorIcon} />
                  {apiError}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button 
          type="button" 
          className={styles.secondaryButton} 
          onClick={onDiscard}
          disabled={isSubmitting || sendingOtp}
        >
          Discard
        </button>
        <button 
          type="button" 
          className={`${styles.primaryButton} ${isSubmitting ? styles.buttonLoading : ''}`} 
          onClick={onSubmit}
          disabled={isSubmitting || sendingOtp || !otpSent || !formik.values.otp || !allChecksValid || !passwordsMatch}
        >
          {isSubmitting ? 'Saving...' : 'Apply Changes'}
        </button>
      </div>
    </div>
  );
}
