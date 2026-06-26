import React from 'react';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import WifiIcon from '@mui/icons-material/Wifi';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import UpdateIcon from '@mui/icons-material/Update';
import styles from '../ParentalControl.module.css';

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Offline';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h}h ago`;
  }
  const d = Math.floor(diff / 86400);
  return `${d}d ago`;
}

export default function DeviceActivityOverview({ selectedDevice = null }) {
  if (!selectedDevice) return null;

  const batteryVal = selectedDevice.batteryLevel ?? selectedDevice.battery_level ?? null;
  const isCharging = selectedDevice.isCharging ?? selectedDevice.is_charging ?? false;
  const networkVal = selectedDevice.networkType ?? selectedDevice.network_type ?? 'WiFi';
  const platform = selectedDevice.platform ?? selectedDevice.type ?? 'Android';
  const lastSeenStr = selectedDevice.lastSeen ?? selectedDevice.updatedAt ?? null;
  const isLowBattery = batteryVal != null && batteryVal < 20;


  return (
    <div className={styles.telemetryGrid}>
      {/* Battery Status */}
      <div className={styles.telemetryCard}>
        <div className={`${styles.telemetryIconWrapper} ${isLowBattery ? styles.telemetryIconDanger : styles.telemetryIconYellow}`}>
          {isLowBattery ? (
            <BatteryAlertIcon />
          ) : (
            <BatteryChargingFullIcon />
          )}
        </div>
        <div className={styles.telemetryDetails}>
          <span className={styles.telemetryLabel}>Battery Level</span>
          <span className={styles.telemetryValue}>
            {batteryVal != null ? `${Math.round(batteryVal)}%` : '—'}
            {isCharging && <span className={styles.chargingBadge}>Charging</span>}
          </span>
        </div>
      </div>

      {/* Network Type */}
      <div className={styles.telemetryCard}>
        <div className={`${styles.telemetryIconWrapper} ${styles.telemetryIconPurple}`}>
          <WifiIcon />
        </div>
        <div className={styles.telemetryDetails}>
          <span className={styles.telemetryLabel}>Network Connection</span>
          <span className={`${styles.telemetryValue} ${styles.capitalizeText}`}>
            {networkVal}
          </span>
        </div>
      </div>

      {/* OS & Platform */}
      <div className={styles.telemetryCard}>
        <div className={`${styles.telemetryIconWrapper} ${styles.telemetryIconOrange}`}>
          <PhoneAndroidIcon />
        </div>
        <div className={styles.telemetryDetails}>
          <span className={styles.telemetryLabel}>OS Platform</span>
          <span className={styles.telemetryValue}>
            {platform} {selectedDevice.osVersion ? `(v${selectedDevice.osVersion})` : ''}
          </span>
        </div>
      </div>

      {/* Last Seen / Synced */}
      <div className={styles.telemetryCard}>
        <div className={`${styles.telemetryIconWrapper} ${styles.telemetryIconYellow}`}>
          <UpdateIcon />
        </div>
        <div className={styles.telemetryDetails}>
          <span className={styles.telemetryLabel}>Last Active</span>
          <span className={styles.telemetryValue}>
            {lastSeenStr ? formatRelativeTime(lastSeenStr) : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
