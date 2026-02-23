import React, { useState } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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

      <div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <p className={styles.sectionDescription} style={{ marginBottom: '8px', marginTop: '-4px' }}>
            We'll send a verification code to reset your password
          </p>
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
              <ErrorOutlineIcon style={{ fontSize: '14px' }} />
              {formik.errors.email}
            </div>
          )}
          {apiError && !otpSent && (
            <div className={styles.errorText}>
              <ErrorOutlineIcon style={{ fontSize: '14px' }} />
              {apiError}
            </div>
          )}
          {!otpSent && (
            <button
              type="button"
              className={`${styles.primaryButton}`}
              onClick={handleSendOTP}
              disabled={sendingOtp || !formik.values.email || (formik.touched.email && formik.errors.email)}
              style={{ marginTop: '12px', width: '100%' }}
            >
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </button>
          )}
        </div>

        {otpSent && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label}>Verification Code</label>
              <input
                type="text"
                name="otp"
                className={`${styles.input} ${(formik.touched.otp && formik.errors.otp) ? styles.inputError : ''}`}
                value={formik.values.otp || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter the code sent to your email"
              />
              {formik.touched.otp && formik.errors.otp && (
                <div className={styles.errorText}>
                  <ErrorOutlineIcon style={{ fontSize: '14px' }} />
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
                />
                <button 
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <VisibilityOffOutlinedIcon style={{ fontSize: '20px' }} />
                  ) : (
                    <VisibilityOutlinedIcon style={{ fontSize: '20px' }} />
                  )}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <div className={styles.errorText}>
                  <ErrorOutlineIcon style={{ fontSize: '14px' }} />
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
                />
                <button 
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <VisibilityOffOutlinedIcon style={{ fontSize: '20px' }} />
                  ) : (
                    <VisibilityOutlinedIcon style={{ fontSize: '20px' }} />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className={styles.errorText}>
                  <ErrorOutlineIcon style={{ fontSize: '14px' }} />
                  {formik.errors.confirmPassword}
                </div>
              )}
            </div>
{formik.values.newPassword && (
                <div style={{ marginTop: '10px' }}>
                  {/* Password Strength Bars */}
                  <div className={styles.passwordStrengthBars}>
                    <div className={`${styles.strengthBar} ${strength === 'weak' ? styles.strengthBarWeak : strength === 'moderate' ? styles.strengthBarModerate : strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                    <div className={`${styles.strengthBar} ${strength === 'moderate' ? styles.strengthBarModerate : strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                    <div className={`${styles.strengthBar} ${strength === 'moderate' ? styles.strengthBarModerate : strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                    <div className={`${styles.strengthBar} ${strength === 'strong' ? styles.strengthBarStrong : ''}`}></div>
                  </div>

                  {/* Password Checklist */}
                  <div className={styles.passwordChecklist}>
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className={`${styles.checklistItem} ${
                          check.check(formik.values.newPassword)
                            ? styles.checklistItemValid
                            : styles.checklistItemInvalid
                        }`}
                      >
                        {check.check(formik.values.newPassword) ? (
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
                    ))}
                  </div>
                </div>
              )}
            {apiError && (
              <div className={styles.errorText} style={{ marginTop: '12px' }}>
                <ErrorOutlineIcon style={{ fontSize: '14px' }} />
                {apiError}
              </div>
            )}
          </>
        )}

      </div>

      {/* Actions */}
      <div className={styles.actions} style={{ marginTop: '20px' }}>
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
