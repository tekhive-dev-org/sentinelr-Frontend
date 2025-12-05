import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import styles from './Settings.module.css';

export default function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  onDelete,
  isDeleting 
}) {
  const [confirmations, setConfirmations] = React.useState({
    cantLogin: false,
    profileRemoved: false
  });
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const isDeleteEnabled = confirmations.cantLogin && 
                         confirmations.profileRemoved && 
                         password.length > 0 &&
                         !isDeleting;

  const handleDelete = () => {
    onDelete(password);
  };

  const handleClose = () => {
    setConfirmations({ cantLogin: false, profileRemoved: false });
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Deleting Your Account</h3>
          <button className={styles.closeButton} onClick={handleClose}>
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
              checked={confirmations.cantLogin}
              onChange={(e) => setConfirmations({...confirmations, cantLogin: e.target.checked})}
            />
            <span>You will no longer be able to log into your account</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={confirmations.profileRemoved}
              onChange={(e) => setConfirmations({...confirmations, profileRemoved: e.target.checked})}
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
          <button className={styles.secondaryButton} onClick={handleClose}>Cancel</button>
          <button 
            className={styles.deleteButton} 
            disabled={!isDeleteEnabled}
            onClick={handleDelete}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
