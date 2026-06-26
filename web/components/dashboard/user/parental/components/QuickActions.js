import React from 'react';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import MoreTimeRoundedIcon from '@mui/icons-material/MoreTimeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import styles from '../ParentalControl.module.css';

export default function QuickActions({
  controls = null,
  handleFreezeToggle = () => {},
  handleBonusHour = () => {},
}) {
  if (!controls) return null;

  const isFrozen = !!controls.quickPause?.isDeviceFrozen;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>
          <span className={styles.cardTitleIcon} style={{ background: '#fff0f1', color: '#dc323f' }}>
            <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />
          </span>
          Quick Protection Actions
        </span>
      </div>
      <p className={styles.quickPauseDesc}>
        Immediately freeze target device activities or grant temporary extensions.
      </p>
      
      <div className={styles.quickActionsContainer}>
        <button
          className={`${styles.freezeBtn} ${isFrozen ? styles.freezeBtnFrozen : styles.freezeBtnActive}`}
          onClick={handleFreezeToggle}
        >
          {isFrozen ? (
            <>
              <LockOpenRoundedIcon sx={{ fontSize: 18 }} />
              UNFREEZE DEVICE
            </>
          ) : (
            <>
              <LockRoundedIcon sx={{ fontSize: 18 }} />
              FREEZE DEVICE
            </>
          )}
        </button>
        
        <button className={styles.bonusBtn} onClick={handleBonusHour}>
          <MoreTimeRoundedIcon sx={{ fontSize: 18 }} /> Grant Bonus Hour (+1h)
        </button>
      </div>
    </div>
  );
}
