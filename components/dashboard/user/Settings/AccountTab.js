import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import styles from './Settings.module.css';
import Toast from '../../../common/Toast';

export default function AccountTab({ user }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmations, setDeleteConfirmations] = useState({
    cantLogin: false,
    profileRemoved: false
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  // 2FA states
  const [show2FAPasswordModal, setShow2FAPasswordModal] = useState(false);
  const [show2FAQRModal, setShow2FAQRModal] = useState(false);
  const [twoFAPassword, setTwoFAPassword] = useState('');
  const [show2FAPassword, setShow2FAPassword] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');

  const formik = useFormik({
    initialValues: {
      username: user?.name || 'Chidi',
      email: user?.email || 'chidibritish@gmail.com',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    onSubmit: (values) => {
      console.log('Account settings updated:', values);
      setToast({ message: 'Settings updated successfully!', type: 'success' });
    },
  });

  const handleDeleteAccount = () => {
    console.log('Account deleted');
    setShowDeleteModal(false);
    setToast({ message: 'Account deletion initiated', type: 'info' });
  };

  const handle2FAPasswordConfirm = () => {
    // In a real app, verify password with backend
    if (twoFAPassword.length > 0) {
      setShow2FAPasswordModal(false);
      setShow2FAQRModal(true);
      setTwoFAPassword('');
    }
  };

  const handle2FAVerify = () => {
    // In a real app, verify the 2FA code with backend
    if (twoFACode.length > 0) {
      console.log('2FA enabled with code:', twoFACode);
      setToast({ message: 'Two-Factor Authentication enabled successfully!', type: 'success' });
      setShow2FAQRModal(false);
      setTwoFACode('');
    }
  };

  const isDeleteEnabled = deleteConfirmations.cantLogin && 
                         deleteConfirmations.profileRemoved && 
                         password.length > 0;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* General Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>General</h3>
        <p className={styles.sectionDescription}>Update your account settings.</p>

        <form onSubmit={formik.handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              className={`${styles.input} ${formik.touched.username && formik.errors.username ? styles.inputError : ''}`}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.username && formik.errors.username && (
              <div className={styles.errorText}>{formik.errors.username}</div>
            )}
            <div className={styles.infoText}>
              <InfoOutlinedIcon style={{ fontSize: '14px' }} />
              Your SENTINELR profile is https://app.sentinelr.com/profile/{formik.values.username.toLowerCase()}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              className={`${styles.input} ${formik.touched.email && formik.errors.email ? styles.inputError : ''}`}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <div className={styles.errorText}>{formik.errors.email}</div>
            )}
            <div className={styles.infoText}>
              To change your email, please <a href="#" style={{ color: '#0f4c75', textDecoration: 'none' }}>contact us</a>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton}>Discard</button>
            <button type="submit" className={styles.primaryButton}>Apply Changes</button>
          </div>
        </form>
      </div>
      <hr className={styles.hr}/>

      {/* Two Factor Authentication Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Two Factor Authentication</h3>
        <p className={styles.sectionDescription}>
          Two-Factor Authentication adds an additional layer of security to your SENTINELR account. Each time you log in to SENTINELR, you will be asked to enter a unique code that is only available on your mobile phone.
        </p>
        <button type="button" className={styles.secondaryButton} onClick={() => setShow2FAPasswordModal(true)}>Enable Two-Factor Authentication</button>
      </div>
      <hr className={styles.hr}/>

      {/* Delete Account Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Delete Account</h3>
        <p className={styles.sectionDescription}>
          If you delete your account, your personal information will be wiped from SENTINELR's servers, all of your activity will be anonymised and will be deleted. This action cannot be undone!
        </p>
        <button 
          type="button" 
          className={styles.dangerButton}
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </div>
     
      {/* 2FA Password Confirmation Modal */}
      {show2FAPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => setShow2FAPasswordModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Enable Two-Factor Authentication</h3>
              <button className={styles.closeButton} onClick={() => setShow2FAPasswordModal(false)}>
                <CloseIcon style={{ fontSize: '20px' }} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={show2FAPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Enter your password......"
                    value={twoFAPassword}
                    onChange={(e) => setTwoFAPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShow2FAPassword(!show2FAPassword)}
                  >
                    {show2FAPassword ? (
                      <VisibilityOffOutlinedIcon style={{ fontSize: '20px' }} />
                    ) : (
                      <VisibilityOutlinedIcon style={{ fontSize: '20px' }} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setShow2FAPasswordModal(false)}>Cancel</button>
              <button 
                className={styles.primaryButton} 
                onClick={handle2FAPasswordConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA QR Code Modal */}
      {show2FAQRModal && (
        <div className={styles.modalOverlay} onClick={() => setShow2FAQRModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Enable Two-Factor Authentication</h3>
              <button className={styles.closeButton} onClick={() => setShow2FAQRModal(false)}>
                <CloseIcon style={{ fontSize: '20px' }} />
              </button>
            </div>
            <div className={styles.modalContent}>
              {/* QR Code */}
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/SENTINELR:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SENTINELR" 
                  alt="QR Code"
                  style={{ width: '120px', height: '120px', display: 'block' }}
                />
              </div>

              {/* Instructions */}
              <p className={styles.twoFAInstructions}>
                Using your favourite two-factor authentication mobile app (we recommend <a href="https://support.google.com/accounts/answer/1066447" target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', textDecoration: 'none' }}>Google Authenticator</a>), scan the barcode display on the screen.
              </p>

              <p className={styles.twoFAInstructions}>
                Once your app recognises your SENTINELR account, enter the code and click "Verify Code"
              </p>

              {/* 2FA Code Input */}
              <div className={styles.formGroup} style={{ marginTop: '20px', marginBottom: 0 }}>
                <label className={styles.label}>Two-Factor Code</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter your password......"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setShow2FAQRModal(false)}>Cancel</button>
              <button 
                className={styles.primaryButton} 
                onClick={handle2FAVerify}
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Deleting Your Account</h3>
              <button className={styles.closeButton} onClick={() => setShowDeleteModal(false)}>
                <CloseIcon style={{ fontSize: '20px' }} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.modalText}>
                If you're sure you want to delete your SENTINELR account, you'll need to enter your password and agree to the following:
              </p>
              
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={deleteConfirmations.cantLogin}
                  onChange={(e) => setDeleteConfirmations({...deleteConfirmations, cantLogin: e.target.checked})}
                />
                <span>You will no longer be able to log into your account</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={deleteConfirmations.profileRemoved}
                  onChange={(e) => setDeleteConfirmations({...deleteConfirmations, profileRemoved: e.target.checked})}
                />
                <span>Personally identifiable information in your profile will be removed.</span>
              </label>

              <div className={styles.formGroup} style={{ marginTop: '20px', marginBottom: 0 }}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Enter your password......"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon style={{ fontSize: '20px' }} />
                    ) : (
                      <VisibilityOutlinedIcon style={{ fontSize: '20px' }} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryButton} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button 
                className={styles.deleteButton} 
                disabled={!isDeleteEnabled}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
