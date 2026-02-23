import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AccountTab from './AccountTab';
import PasswordTab from './PasswordTab';
import NotificationsTab from './NotificationsTab';
import styles from './Settings.module.css';
import Toast from '../../../common/Toast';
import SettingsService, { SettingsError } from './SettingsService';
import { useAuth } from '../../../../context/AuthContext';

export default function UserSettings({ user }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Account');
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Handle auth errors by logging out user
  const handleError = (error) => {
    if (error instanceof SettingsError) {
      // Logout if session expired or unauthorized
      if (error.code === 'UNAUTHORIZED' || error.code === 'MISSING_TOKEN' || error.statusCode === 401) {
        setToast({ message: 'Your session has expired. Logging out...', type: 'error' });
        setTimeout(() => {
          logout();
        }, 1500);
        return;
      }
    }
    setToast({ message: error.message || 'Failed to update settings', type: 'error' });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      // Account
      fullName: user?.fullName || user?.userName || user?.name || '',
      phoneNumber: user?.phoneNumber || user?.phone || '',
      username: user?.username || user?.userName || user?.name || '',
      email: user?.email || '',
      profilePicture: null,
      profilePictureUrl: user?.profilePicture || user?.avatarUrl || user?.photoUrl || '',
      
      // 2FA
      is2FAEnabled: Boolean(user?.is2FAEnabled),

      // Password
      otp: '',
      newPassword: '',
      confirmPassword: '',

      // Notifications
      projectFeedback: true,
      newContent: true,
      specialPromotions: false,
      weeklyProgress: false
    },
    validationSchema: Yup.object({
      // Account Validation
      fullName: Yup.string().required('Full name is required'),
      phoneNumber: Yup.string().required('Phone number is required'),
      username: Yup.string().required('Username is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),

      // Password Validation (only if fields are touched or filled)
      email: Yup.string().email('Invalid email').required('Email is required'),
      otp: Yup.string().test('required-if-new-password', 'OTP is required to change password', function(value) {
        return this.parent.newPassword ? !!value : true;
      }),
      newPassword: Yup.string()
        .min(8, 'At least 8 characters')
        .matches(/[A-Z]/, 'At least 1 uppercase')
        .matches(/[0-9]/, 'At least 1 number')
        .matches(/[^A-Za-z0-9]/, 'At least 1 special character'),
      confirmPassword: Yup.string()
        .test('passwords-match', 'Passwords must match', function(value) {
          return this.parent.newPassword ? value === this.parent.newPassword : true;
        }),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        // Prepare profile payload
        const profilePayload = {
          userName: values.username || values.fullName,
          email: values.email,
          phone: values.phoneNumber,
        };

        // Update profile information
        await SettingsService.updateProfile(profilePayload);

        // Upload profile picture if changed
        if (values.profilePicture) {
          try {
            const uploadResult = await SettingsService.uploadProfilePicture(values.profilePicture);
            // Handle multiple response structures: direct URL, nested response, or data wrapper
            const uploadedUrl = uploadResult?.profilePicture || uploadResult?.data?.profilePicture || uploadResult?.url;
            if (uploadedUrl) {
              formik.setFieldValue('profilePictureUrl', uploadedUrl);
            }
          } catch (uploadErr) {
            // Profile was updated but image upload failed - show warning
            console.warn('Profile picture upload failed:', uploadErr);
            setToast({ message: 'Profile updated but picture upload failed. Please try again.', type: 'warning' });
          } finally {
            formik.setFieldValue('profilePicture', null);
          }
        }

        // Handle password change if provided
        if (values.newPassword && values.otp && values.confirmPassword) {
          try {
            await SettingsService.changePassword(values.email, values.otp, values.newPassword, values.confirmPassword);
          } catch (passwordErr) {
            // Show password-specific errors inline
            if (passwordErr.code === 'INVALID_OTP' || 
                passwordErr.statusCode === 400 || 
                passwordErr.statusCode === 401) {
              setPasswordError(passwordErr.message || 'Invalid OTP or password change failed');
              setActiveTab('Password');
              throw passwordErr; // Re-throw to prevent success message
            }
            throw passwordErr;
          }
        }

        setToast({ message: 'All changes saved successfully!', type: 'success' });
        setPasswordError(''); // Clear password error on success

        // Clear password fields after successful save
        if (values.newPassword) {
          resetForm({ values: { ...values, otp: '', newPassword: '', confirmPassword: '' } });
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleDiscard = () => {
    formik.resetForm();
    setToast({ message: 'Changes discarded', type: 'info' });
  };

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className={styles.tabs}>
        {['Account', 'Password', 'Notifications'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'Account' && (
          <AccountTab 
            formik={formik}
            isSubmitting={isSubmitting}
            onSubmit={formik.handleSubmit}
            onDiscard={handleDiscard}
          />
        )}
        {activeTab === 'Password' && (
          <PasswordTab 
            formik={formik} 
            apiError={passwordError}
            onClearError={() => setPasswordError('')}
            isSubmitting={isSubmitting}
            onSubmit={formik.handleSubmit}
            onDiscard={handleDiscard}
          />
        )}
        {activeTab === 'Notifications' && (
          <NotificationsTab 
            formik={formik}
            isSubmitting={isSubmitting}
            onSubmit={formik.handleSubmit}
            onDiscard={handleDiscard}
          />
        )}
      </div>
    </div>
  );
}
