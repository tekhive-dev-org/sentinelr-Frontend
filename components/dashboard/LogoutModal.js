import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LogoutModal.module.css';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.backdrop}
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={styles.modal}
          >
            <div className={styles.iconWrapper}>
               <LogoutOutlinedIcon className={styles.icon} />
            </div>
            <h3 className={styles.title}>Log out of your account?</h3>
            <p className={styles.message}>
              You will need to sign in again to access the dashboard.
            </p>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button className={styles.confirmBtn} onClick={onConfirm}>
                Log Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(content, document.body);
}
