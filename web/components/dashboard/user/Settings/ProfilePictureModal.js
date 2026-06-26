import React from 'react';
import ReactDOM from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import PublicIcon from '@mui/icons-material/Public';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import styles from './Settings.module.css';

export default function ProfilePictureModal({ 
  isOpen, 
  onClose, 
  currentImage,
  onImageChange,
  onImageRemove 
}) {
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageChange(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const content = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.profileModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.modalHeader} ${styles.profileModalHeader}`}>
          <h3 className={`${styles.modalTitle} ${styles.profileModalTitle}`}>Sentinelr Account</h3>
          <button 
            className={`${styles.closeButton} ${styles.profileModalClose}`} 
            onClick={onClose}
            type="button"
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.profileModalContent}>
          <div className={styles.profileModalIntro}>
            <h4>Profile Picture</h4>
            <p>
              A picture helps people recognize you and lets you know when you are signed into your account
            </p>
          </div>

          <div className={styles.visibilityBadge}>
            <PublicIcon className={styles.visibilityIcon} />
            <span>Visible to anyone</span>
          </div>

          <div className={styles.avatarContainer}>
            <img 
              src={currentImage} 
              alt="Profile Large" 
              className={styles.largeAvatar}
            />
            <div className={styles.cameraButtonLarge} onClick={triggerFileInput}>
              <CameraAltOutlinedIcon />
            </div>
          </div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className={styles.hiddenInput}
            accept="image/png, image/jpeg, image/svg+xml"
          />

          <div className={styles.profileModalActions}>
            <button type="button" className={styles.changeButton} onClick={triggerFileInput}>
              <EditIcon className={styles.actionIcon} />
              Change
            </button>
            <button type="button" className={styles.removeButton} onClick={onImageRemove}>
              <DeleteOutlineIcon className={styles.actionIcon} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}
