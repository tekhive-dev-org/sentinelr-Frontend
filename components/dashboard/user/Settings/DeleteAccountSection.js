import React from 'react';
import styles from './Settings.module.css';

export default function DeleteAccountSection({ onDeleteClick }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Delete Account</h3>
      <p className={styles.sectionDescription}>
        If you delete your account, your personal information will be wiped from SENTINELR's servers, all of your activity will be anonymised and will be deleted. This action cannot be undone!
      </p>
      <button 
        type="button" 
        className={styles.dangerButton}
        onClick={onDeleteClick}
      >
        Delete Account
      </button>
    </div>
  );
}
