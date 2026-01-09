import React, { useState } from 'react';
import Toast from '../../../common/Toast';
import styles from './Settings.module.css';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

export default function NotificationsTab({ formik }) {
  const [toast, setToast] = useState(null);

  const handleToggle = (key) => {
    formik.setFieldValue(key, !formik.values[key]);
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
              checked={formik.values.projectFeedback}
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
              checked={formik.values.newContent}
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
              checked={formik.values.specialPromotions}
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
              checked={formik.values.weeklyProgress}
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
    </div>
  );
}
