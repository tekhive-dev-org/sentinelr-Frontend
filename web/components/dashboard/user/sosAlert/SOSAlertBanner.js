/**
 * SOSAlertBanner
 * Red critical SOS banner showing the active alert with device stats and action buttons.
 */

import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import SpeedIcon from '@mui/icons-material/Speed';
import ExploreIcon from '@mui/icons-material/Explore';
import PhoneIcon from '@mui/icons-material/Phone';
import ShareIcon from '@mui/icons-material/Share';
import styles from './SOSAlert.module.css';

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--';
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function SOSAlertBanner({ alert, onCall, onShare, onResolve, onDismiss }) {
  if (!alert) return null;

  const batteryLevel = alert.deviceInfo?.batteryLevel ?? '--';
  const batteryStatus = alert.deviceInfo?.batteryStatus || 'Unknown';
  const speed = alert.deviceInfo?.speed ?? '--';
  const speedUnit = alert.deviceInfo?.speedUnit || 'mph';
  const movementType = alert.deviceInfo?.movementType || 'Unknown';
  const heading = alert.deviceInfo?.heading || '--';
  const statusLabel = alert.deviceInfo?.status || 'Moving';

  return (
    <div className={styles.sosInfoColumn}>
      {/* Critical Banner */}
      <div className={styles.criticalBanner}>
        <div className={styles.bannerTop}>
          <div>
            <span className={styles.bannerLabel}>CRITICAL SOS</span>
            <span className={styles.bannerSubLabel}>TRIGGERED</span>
          </div>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            LIVE
          </span>
        </div>
        <div className={styles.bannerName}>{alert.userName || 'Unknown'}</div>
      </div>

      {/* Device Stats */}
      <div className={styles.deviceStatsGrid}>
        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <AccessTimeIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Time Triggered</span>
            <span className={styles.deviceStatValue}>{formatTime(alert.createdAt)}</span>
            <span className={`${styles.deviceStatSublabel} ${styles.alertValue}`}>
              {formatTimeAgo(alert.createdAt)}
            </span>
          </div>
        </div>

        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <BatteryAlertIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Battery Level</span>
            <span className={styles.deviceStatValue}>
              {typeof batteryLevel === 'number' ? `${batteryLevel}%` : batteryLevel}
            </span>
            <span className={styles.deviceStatSublabel}>{batteryStatus}</span>
          </div>
        </div>

        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <SpeedIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Speed</span>
            <span className={styles.deviceStatValue}>
              {speed} {speedUnit}
            </span>
            <span className={styles.deviceStatSublabel}>{movementType}</span>
          </div>
        </div>

        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <ExploreIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Status</span>
            <span className={styles.deviceStatValue}>{statusLabel}</span>
            <span className={styles.deviceStatSublabel}>Heading: {heading}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button className={styles.callBtn} onClick={onCall}>
          <PhoneIcon style={{ fontSize: 18 }} />
          Call {alert.userName?.split(' ')[0] || 'User'}
        </button>

        <button className={styles.shareBtn} onClick={onShare}>
          <ShareIcon style={{ fontSize: 18 }} />
          Share Tracking Link
        </button>

        <div className={styles.resolveActions}>
          <button className={styles.resolveBtn} onClick={onResolve}>
            Mark Resolved
          </button>
          <button className={styles.dismissBtn} onClick={onDismiss}>
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
}
