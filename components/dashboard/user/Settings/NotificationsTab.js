import React, { useState } from 'react';
import Toast from '../../../common/Toast';
import styles from './Settings.module.css';

export default function NotificationsTab() {
  const [preferences, setPreferences] = useState({
    projectFeedback: true,
    newContent: true,
    specialPromotions: false,
    weeklyProgress: false
  });
  const [toast, setToast] = useState(null);

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log('Notification preferences updated:', preferences);
    setToast({ message: 'Notification preferences saved!', type: 'success' });
  };

  return (
    <div className={styles.section}>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <h3 className={styles.sectionTitle}>Notification Preferences</h3>
      <p className={styles.sectionDescription}>Choose what notifications you want to receive.</p>

      <div>
        <div className={styles.toggleItem}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={preferences.projectFeedback}
              onChange={() => handleToggle('projectFeedback')}
            />
            <span className={styles.slider}></span>
          </label>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleTitle}>Project feedback</div>
            <div className={styles.toggleDescription}>Get notified whenever an anonymous activity is performed on your SENTINELR application.</div>
          </div>
        </div>

        <div className={styles.toggleItem}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={preferences.newContent}
              onChange={() => handleToggle('newContent')}
            />
            <span className={styles.slider}></span>
          </label>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleTitle}>New content announcements</div>
            <div className={styles.toggleDescription}>Get all the latest updates on all new content releases and product features.</div>
          </div>
        </div>

        <div className={styles.toggleItem}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={preferences.specialPromotions}
              onChange={() => handleToggle('specialPromotions')}
            />
            <span className={styles.slider}></span>
          </label>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleTitle}>Special promotions</div>
            <div className={styles.toggleDescription}>Who doesn't love discounts? We'll often send special offers that you surely don't want to miss</div>
          </div>
        </div>

        <div className={styles.toggleItem}>
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={preferences.weeklyProgress}
              onChange={() => handleToggle('weeklyProgress')}
            />
            <span className={styles.slider}></span>
          </label>
          <div className={styles.toggleInfo}>
            <div className={styles.toggleTitle}>Weekly progress summary</div>
            <div className={styles.toggleDescription}>Keep track of your weekly activity and receive an informative weekly report.</div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton}>Discard</button>
        <button type="button" className={styles.primaryButton} onClick={handleSave}>Apply Changes</button>
      </div>
    </div>
  );
}
