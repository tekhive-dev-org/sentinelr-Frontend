import React from 'react';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import styles from '../ParentalControl.module.css';

const CATEGORY_CONFIG = {
  Gaming: { icon: <SportsEsportsRoundedIcon />, className: 'categoryIconRed' },
  'Social Media': { icon: <GroupRoundedIcon />, className: 'categoryIconYellow' },
  Entertainment: { icon: <MovieRoundedIcon />, className: 'categoryIconYellow' },
  TikTok: { icon: <MusicNoteRoundedIcon />, className: 'categoryIconPurple' },
  Facebook: { icon: <FacebookRoundedIcon />, className: 'categoryIconPurple' },
  WhatsApp: { icon: <ChatRoundedIcon />, className: 'categoryIconYellow' },
};
const DEFAULT_CATEGORY = { icon: <SmartphoneRoundedIcon />, className: 'categoryIconNeutral' };

export default function AppBlockingManager({
  appBlocking = null,
  handleToggleCategory = () => {},
  handleToggleApp = () => {},
}) {
  if (!appBlocking) return null;

  return (
    <div className={styles.appBlockingContainer}>
      <h3 className={styles.sectionTitle}>
        <SecurityRoundedIcon />
        App Category Blocking
      </h3>
      
      <div className={styles.categoryList}>
        {/* Category toggles */}
        {(appBlocking.categoryBlocked || []).map((cat) => {
          const config = CATEGORY_CONFIG[cat.category] || DEFAULT_CATEGORY;
          return (
            <div key={cat.category} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <div className={`${styles.categoryIcon} ${styles[config.className]}`}>
                  {config.icon}
                </div>
                <div className={styles.categoryDetails}>
                  <span className={styles.categoryName}>{cat.category}</span>
                  <span className={styles.categoryMeta}>{cat.appsDetected} apps detected</span>
                </div>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={cat.enabled}
                  onChange={() => handleToggleCategory(cat.category, cat.enabled)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          );
        })}

        {/* Individual app overrides */}
        {(appBlocking.appOverrides || []).map((app) => {
          const config = CATEGORY_CONFIG[app.name] || DEFAULT_CATEGORY;
          return (
            <div key={app.packageName} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <div className={`${styles.categoryIcon} ${styles[config.className]}`}>
                  {config.icon}
                </div>
                <div className={styles.categoryDetails}>
                  <span className={styles.categoryName}>{app.name}</span>
                  <span className={styles.categoryMeta}>{app.note}</span>
                </div>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={app.isBlocked}
                  onChange={() => handleToggleApp(app.packageName, app.isBlocked)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
