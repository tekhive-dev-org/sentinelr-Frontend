import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import Toast from '../../../common/Toast';

// Sub-components
import GeneralSection from './GeneralSection';
import TwoFactorSection from './TwoFactorSection';
import DeleteAccountSection from './DeleteAccountSection';
import ProfilePictureModal from './ProfilePictureModal';
import DeleteAccountModal from './DeleteAccountModal';
import SettingsService from './SettingsService';

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80";

export default function AccountTab({ formik, isSubmitting, onSubmit, onDiscard }) {
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  // Image state
  const [previewImage, setPreviewImage] = useState(
    formik.values.profilePictureUrl || DEFAULT_AVATAR
  );

  // Toast
  const [toast, setToast] = useState(null);

  // Handlers
  useEffect(() => {
    if (formik.values.profilePictureUrl) {
      setPreviewImage(formik.values.profilePictureUrl);
    }
  }, [formik.values.profilePictureUrl]);

  const handleImageChange = (file) => {
    formik.setFieldValue('profilePicture', file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    setShowProfileModal(false);
    setToast({ message: 'Profile picture selected. Click Apply Changes to save.', type: 'info' });
  };

  const handleImageRemove = () => {
    setPreviewImage(DEFAULT_AVATAR);
    formik.setFieldValue('profilePicture', null);
    formik.setFieldValue('profilePictureUrl', '');
    setShowProfileModal(false);
    setToast({ message: 'Profile picture removed', type: 'info' });
  };

  const handle2FAToggle = async () => {
    const newValue = !formik.values.is2FAEnabled;
    setIsToggling2FA(true);
    try {
      const result = await SettingsService.toggle2FA(newValue);
      formik.setFieldValue('is2FAEnabled', newValue);
      setToast({ message: result.message, type: newValue ? 'success' : 'info' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setIsToggling2FA(false);
    }
  };

  const handleDeleteAccount = async (password) => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await SettingsService.deleteAccount(password);
      setShowDeleteModal(false);
      setToast({ message: 'Account deletion initiated', type: 'info' });
      // TODO: Redirect to logout or goodbye page
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* General Section */}
      <GeneralSection 
        formik={formik} 
        previewImage={previewImage}
        onProfileClick={() => setShowProfileModal(true)}
      />
      <hr className={styles.hr}/>

      {/* Two Factor Authentication Section */}
      <TwoFactorSection 
        isEnabled={formik.values.is2FAEnabled}
        onToggle={handle2FAToggle}
        isLoading={isToggling2FA}
      />
      <hr className={styles.hr}/>

      {/* Delete Account Section */}
      <DeleteAccountSection 
        onDeleteClick={() => setShowDeleteModal(true)}
      />
     
      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentImage={previewImage}
        onImageChange={handleImageChange}
        onImageRemove={handleImageRemove}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError('');
        }}
        onDelete={handleDeleteAccount}
        isDeleting={isDeleting}
        deleteError={deleteError}
      />

      {/* Actions */}
      <div className={styles.actions} style={{ marginTop: '20px' }}>
        <button 
          type="button" 
          className={styles.secondaryButton} 
          onClick={onDiscard}
          disabled={isSubmitting}
        >
          Discard
        </button>
        <button 
          type="button" 
          className={`${styles.primaryButton} ${isSubmitting ? styles.buttonLoading : ''}`} 
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Apply Changes'}
        </button>
      </div>
    </div>
  );
}
