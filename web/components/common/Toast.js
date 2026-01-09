import React, { useEffect } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircleOutlineIcon style={{ fontSize: '20px' }} />,
    error: <ErrorOutlineIcon style={{ fontSize: '20px' }} />,
    info: <InfoOutlinedIcon style={{ fontSize: '20px' }} />
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.iconWrapper}>
        {icons[type]}
      </div>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeButton} onClick={onClose}>
        <CloseIcon style={{ fontSize: '18px' }} />
      </button>
    </div>
  );
}
