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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className={styles.modalHeader} style={{ justifyContent: 'center', position: 'relative', marginBottom: '8px' }}>
          <h3 className={styles.modalTitle} style={{ fontSize: '24px' }}>Sentinelr Account</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            style={{ position: 'absolute', right: '-10px', top: '-10px' }}
          >
            <CloseIcon style={{ fontSize: '24px', color: '#1a1a1a' }} />
          </button>
        </div>

        <div className={styles.profileModalContent}>
          <div style={{ width: '100%', textAlign: 'left', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' }}>Profile Picture</h4>
            <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.5' }}>
              A picture helps people recognize you and lets you know when you are signed into your account
            </p>
          </div>

          <div className={styles.visibilityBadge}>
            <PublicIcon style={{ fontSize: '20px', color: '#4b5563' }} />
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
            style={{ display: 'none' }} 
            accept="image/png, image/jpeg, image/svg+xml"
          />

          <div className={styles.profileModalActions}>
            <button className={styles.changeButton} onClick={triggerFileInput}>
              <EditIcon style={{ fontSize: '18px' }} />
              Change
            </button>
            <button className={styles.removeButton} onClick={onImageRemove}>
              <DeleteOutlineIcon style={{ fontSize: '18px' }} />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}
