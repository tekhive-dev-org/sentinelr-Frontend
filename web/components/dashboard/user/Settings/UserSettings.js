import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AccountTab from './AccountTab';
import PasswordTab from './PasswordTab';
import NotificationsTab from './NotificationsTab';
import styles from './Settings.module.css';
import Toast from '../../../common/Toast';
import SettingsService from './SettingsService';

export default function UserSettings({ user }) {
  const [activeTab, setActiveTab] = useState('Account');
  const [toast, setToast] = useState(null);

  // Simulated correct password for validation (in real app, this would be server-side)
  const CORRECT_OLD_PASSWORD = 'Chidiebere2025';

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
      oldPassword: '',
      newPassword: '',

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
      oldPassword: Yup.string().test('required-if-new-password', 'Old password is required to change password', function(value) {
        return this.parent.newPassword ? !!value : true;
      }),
      newPassword: Yup.string().min(8, 'Password must be at least 8 characters'),
    }),
    onSubmit: async (values, { resetForm }) => {
      // Password Validation Logic
      if (values.newPassword) {
        if (!values.oldPassword) {
          setToast({ message: 'Old password is required to set a new password', type: 'error' });
          return;
        }
        if (values.oldPassword !== CORRECT_OLD_PASSWORD) {
          setToast({ message: 'Provided old password is not correct', type: 'error' });
          return;
        }
      }

      try {
        const profilePayload = {
          userName: values.username || values.fullName,
          email: values.email,
          phone: values.phoneNumber,
        };

        await SettingsService.updateProfile(profilePayload);

        if (values.profilePicture) {
          const uploadResult = await SettingsService.uploadProfilePicture(values.profilePicture);
          const uploadedUrl = uploadResult?.profilePicture || uploadResult?.data?.profilePicture;
          if (uploadedUrl) {
            formik.setFieldValue('profilePictureUrl', uploadedUrl);
          }
          formik.setFieldValue('profilePicture', null);
        }

        setToast({ message: 'All changes saved successfully!', type: 'success' });

        // Clear password fields after successful save
        if (values.newPassword) {
          resetForm({ values: { ...values, oldPassword: '', newPassword: '' } });
        }
      } catch (error) {
        setToast({ message: error.message || 'Failed to update settings', type: 'error' });
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
        {activeTab === 'Account' && <AccountTab formik={formik} />}
        {activeTab === 'Password' && <PasswordTab formik={formik} />}
        {activeTab === 'Notifications' && <NotificationsTab formik={formik} />}
      </div>

      {/* Global Actions */}
      <div className={styles.actions} style={{ marginTop: '20px', padding: '0 32px 52px' }}>
        <button type="button" className={styles.secondaryButton} onClick={handleDiscard}>Discard</button>
        <button type="button" className={styles.primaryButton} onClick={formik.handleSubmit}>Apply Changes</button>
      </div>
    </div>
  );
}
