import React, { useState, useEffect } from 'react';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import styles from '../ParentalControl.module.css';

export default function ScreenTimeManager({
  screenTimeLimit = null,
  bedtime = null,
  deviceId = null,
  onEditBedtime = () => {},
  formatMinutes = () => {},
  onSaveScreenTime = () => {},
}) {
  const [localTimer, setLocalTimer] = useState(null);
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [limitMinutes, setLimitMinutes] = useState(60);

  useEffect(() => {
    if (screenTimeLimit) {
      setLimitEnabled(!!screenTimeLimit.enabled);
      setLimitMinutes(screenTimeLimit.dailyLimit || 60);
    }
  }, [screenTimeLimit]);

  useEffect(() => {
    if (!screenTimeLimit || !screenTimeLimit.enabled || !deviceId) {
      setLocalTimer(null);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const apiDailyLimit = screenTimeLimit.dailyLimit || 0;
    const apiUsedToday = screenTimeLimit.usedToday || 0;
    const apiRemaining = screenTimeLimit.remaining || 0;

    // Local storage persistence system to prevent resets on tab switch / reload
    const localKey = `sentinelr_timer_${deviceId}`;
    let currentTimer = null;
    const localDataStr = localStorage.getItem(localKey);

    if (localDataStr) {
      try {
        const local = JSON.parse(localDataStr);
        // Ensure same day and same limit to apply continuous calculations
        if (local.date === todayStr && local.dailyLimit === apiDailyLimit) {
          const elapsedMins = (Date.now() - local.lastSaved) / 60000;
          // Sync check: take whichever is higher to prevent resetting if API is stale
          const currentUsed = Math.max(apiUsedToday, local.usedToday + elapsedMins);
          const currentRemaining = Math.max(0, apiDailyLimit - currentUsed);

          currentTimer = {
            date: todayStr,
            dailyLimit: apiDailyLimit,
            usedToday: currentUsed,
            remaining: currentRemaining,
            lastSaved: Date.now(),
          };
        }
      } catch (e) {
        console.error('Error parsing local timer', e);
      }
    }

    if (!currentTimer) {
      currentTimer = {
        date: todayStr,
        dailyLimit: apiDailyLimit,
        usedToday: apiUsedToday,
        remaining: apiRemaining,
        lastSaved: Date.now(),
      };
    }

    localStorage.setItem(localKey, JSON.stringify(currentTimer));
    setLocalTimer(currentTimer);

    // Live update loop every second
    const interval = setInterval(() => {
      setLocalTimer((prev) => {
        if (!prev) return null;
        const now = Date.now();
        const elapsedMins = (now - prev.lastSaved) / 60000;
        const nextUsed = prev.usedToday + elapsedMins;
        const nextRemaining = Math.max(0, prev.dailyLimit - nextUsed);

        const updated = {
          ...prev,
          usedToday: nextUsed,
          remaining: nextRemaining,
          lastSaved: now,
        };

        localStorage.setItem(localKey, JSON.stringify(updated));
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screenTimeLimit, deviceId]);

  const displayLimit = localTimer ? localTimer.dailyLimit : (screenTimeLimit?.dailyLimit || 0);
  const displayUsed = localTimer ? localTimer.usedToday : (screenTimeLimit?.usedToday || 0);
  const displayRemaining = localTimer ? localTimer.remaining : (screenTimeLimit?.remaining || 0);

  const usedPercent = displayLimit
    ? Math.min(100, Math.round((displayUsed / displayLimit) * 100))
    : 0;

  // Premium live ticking layout formatter
  const formatLiveTime = (mins) => {
    if (mins <= 0) return '0s';
    const totalSeconds = Math.round(mins * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    let res = '';
    if (h > 0) res += `${h}h `;
    if (m > 0 || h > 0) res += `${m}m `;
    res += `${s}s`;
    return res;
  };

  return (
    <div className={styles.screenTimeGrid}>
      {/* ── Screen Time Allowed ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            <span className={`${styles.cardTitleIcon} ${styles.iconPurple}`}>
              <BarChartRoundedIcon />
            </span>
            Daily Screen Time
          </span>
          <span className={styles.cardSubtext}>Target: {formatMinutes(displayLimit)}</span>
        </div>
        <div className={styles.screenTimeValue}>
          {screenTimeLimit?.enabled ? formatLiveTime(displayUsed) : 'Disabled'}
        </div>
        <div className={styles.screenTimeRemaining}>
          {screenTimeLimit?.enabled ? `${formatLiveTime(displayRemaining)} remaining` : 'No limits configured'}
        </div>
        
        {screenTimeLimit?.enabled && (
          <div className={styles.progressBar}>
            <progress
              className={`${styles.progressFill} ${
                usedPercent > 90
                  ? styles.progressFillDanger
                  : usedPercent > 75
                  ? styles.progressFillWarn
                  : styles.progressFillSafe
              }`}
              value={usedPercent}
              max={100}
              aria-label="Screen time used"
            />
          </div>
        )}

        <div className={styles.screenTimeBreakdown}>
          {screenTimeLimit?.breakdown && Object.keys(screenTimeLimit.breakdown).length > 0 ? (
            Object.entries(screenTimeLimit.breakdown).slice(0, 2).map(([key, val]) => (
              <div key={key} className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className={styles.breakdownValue}>{formatMinutes(val)}</div>
              </div>
            ))
          ) : (
            <span className={styles.inlineEmptyText}>
              No application usage breakdown logs found today.
            </span>
          )}
        </div>
      </div>

      {/* ── Screen Time Config Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            <span className={`${styles.cardTitleIcon} ${styles.iconOrange}`}>
              <TimerRoundedIcon />
            </span>
            Configure Daily Limit
          </span>
        </div>
        
        <div className={styles.toggleRow}>
          <span className={styles.fieldLabelText}>Enable Screen Time Limit</span>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={limitEnabled}
              onChange={(e) => setLimitEnabled(e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
        
        {limitEnabled && (
          <div className={styles.limitConfigPanel}>
            <span className={styles.fieldLabelText}>Daily Time Allowed</span>
            <select
              className={`${styles.deviceSelect} ${styles.fullWidthSelect}`}
              value={limitMinutes}
              onChange={(e) => setLimitMinutes(Number(e.target.value))}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
              <option value={240}>4 hours</option>
              <option value={300}>5 hours</option>
              <option value={360}>6 hours</option>
            </select>
          </div>
        )}

        <button
          className={styles.saveLimitBtn}
          onClick={() => onSaveScreenTime({
            enabled: limitEnabled,
            dailyLimit: limitMinutes,
            schedule: { weekdays: limitMinutes, weekends: limitMinutes }
          })}
        >
          Save Screen Time Settings
        </button>
      </div>

      {/* ── Bedtime Card ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            <span className={`${styles.cardTitleIcon} ${styles.iconYellow}`}>
              <BedtimeRoundedIcon />
            </span>
            Bedtime Schedule
          </span>
        </div>
        
        <div className={styles.bedtimeRow}>
          <div className={styles.bedtimeItem}>
            <span className={styles.bedtimeLabel}>Start lock</span>
            <span className={styles.bedtimeValue}>{bedtime?.startTime || '21:30'}</span>
          </div>
          <div className={styles.bedtimeItem}>
            <span className={styles.bedtimeLabel}>End lock</span>
            <span className={styles.bedtimeValue}>{bedtime?.endTime || '07:00'}</span>
          </div>
        </div>
        
        <button className={styles.editScheduleBtn} onClick={onEditBedtime}>
          Edit Bedtime Schedule
        </button>
      </div>
    </div>
  );
}
