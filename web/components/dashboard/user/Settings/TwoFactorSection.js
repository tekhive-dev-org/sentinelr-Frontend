import React from 'react';
import styles from './Settings.module.css';

export default function TwoFactorSection({ isEnabled, onToggle, isLoading }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Two Factor Authentication</h3>
      <p className={styles.sectionDescription}>
        Two-Factor Authentication adds an additional layer of security to your SENTINELR account. Each time you log in to SENTINELR, you will be asked to enter a unique code that is only available on your mobile phone.
      </p>
      
      <div className={styles.toggleItem} style={{ border: 'none', padding: 0 }}>
        <label className={`${styles.switch} ${isLoading ? styles.switchLoading : ''}`}>
          <input 
            type="checkbox" 
            checked={isEnabled}
            onChange={onToggle}
            disabled={isLoading}
          />
          <span className={styles.slider}></span>
        </label>
        <div className={styles.toggleInfo} style={{ paddingLeft: '16px' }}>
          <div className={styles.toggleTitle} style={{ marginBottom: 0 }}>
            {isLoading ? 'Updating...' : 'Enable Two-Factor Authentication'}
          </div>
        </div>
      </div>
    </div>
  );
}
