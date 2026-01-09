import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Toast from '../../../common/Toast';
import styles from './Settings.module.css';

export default function PasswordTab({ formik }) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [toast, setToast] = useState(null);

  // Handle old password change and clear error
  const handleOldPasswordChange = (e) => {
    formik.handleChange(e);
    setOldPasswordError('');
  };

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

      <p className={styles.sectionDescription}>Update your password to ensure your account remains private and secure.</p>

      <div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Old Password</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              className={`${styles.input} ${(formik.touched.oldPassword && formik.errors.oldPassword) || oldPasswordError ? styles.inputError : ''}`}
              value={formik.values.oldPassword}
              onChange={handleOldPasswordChange}
              onBlur={formik.handleBlur}
            />
            <button 
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? (
                <VisibilityOffOutlinedIcon style={{ fontSize: '20px' }} />
              ) : (
                <VisibilityOutlinedIcon style={{ fontSize: '20px' }} />
              )}
            </button>
          </div>
          {/* Show validation errors dynamically */}
          {formik.touched.oldPassword && formik.errors.oldPassword && (
            <div className={styles.errorText}>
              <ErrorOutlineIcon style={{ fontSize: '14px' }} />
              {formik.errors.oldPassword}
            </div>
          )}
          {oldPasswordError && (
            <div className={styles.errorText}>
              <ErrorOutlineIcon style={{ fontSize: '14px' }} />
              {oldPasswordError}
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

      </div>
    </div>
  );
}
