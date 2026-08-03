import { useCallback } from 'react';
import SectionCard from '../users/SectionCard';
import DevicesIcon from '@mui/icons-material/Devices';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import styles from './DeviceDetailCard.module.css';

function getPlatformIcon(platform) {
  const lower = (platform || '').toLowerCase();
  if (lower.includes('ios') || lower.includes('apple') || lower.includes('mac')) return AppleIcon;
  if (lower.includes('android')) return AndroidIcon;
  return DevicesIcon;
}

/**
 * Formats a date string into a human-friendly "Month DD, YYYY" format.
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DeviceDetailCard({ device, isLoading }) {
  const isEmpty = !device;

  const handleCopyId = useCallback(() => {
    if (device?.deviceId) {
      navigator.clipboard.writeText(device.deviceId).catch(() => {});
    }
  }, [device]);

  const PlatformIcon = device ? getPlatformIcon(device.platform) : DevicesIcon;
  const pairedDate = device?.pairedDate ? formatDate(device.pairedDate) : null;
  const isStale = device?.isStale === true;

  return (
    <SectionCard
      title="Device Details"
      icon={DevicesIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="Device details unavailable"
    >
      {device && (
        <div className={styles.content}>
          {isStale && (
            <div className={styles.staleBanner} role="alert">
              <WarningAmberIcon className={styles.staleIcon} aria-hidden="true" />
              <span className={styles.staleText}>Device may be inactive</span>
            </div>
          )}

          <h4 className={styles.deviceName}>{device.name}</h4>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.label}>Platform</span>
              <span className={styles.value}>
                <PlatformIcon className={styles.platformIcon} aria-hidden="true" />
                {device.platform || 'Unknown'}
                {device.osVersion && (
                  <span className={styles.osVersion}>{device.osVersion}</span>
                )}
              </span>
            </div>

            {device.appVersion && (
              <div className={styles.row}>
                <span className={styles.label}>App Version</span>
                <span className={styles.value}>{device.appVersion}</span>
              </div>
            )}

            {device.deviceId && (
              <div className={styles.row}>
                <span className={styles.label}>Device ID</span>
                <span className={styles.value}>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={handleCopyId}
                    title="Copy device ID"
                  >
                    <code className={styles.deviceId}>{device.deviceId}</code>
                    <ContentCopyIcon className={styles.copyIcon} aria-hidden="true" />
                  </button>
                </span>
              </div>
            )}

            {device.status && (
              <div className={styles.row}>
                <span className={styles.label}>Status</span>
                <span className={styles.value}>
                  <span
                    className={`${styles.pill} ${
                      device.status === 'active'
                        ? styles.pillActive
                        : device.status === 'inactive'
                        ? styles.pillInactive
                        : styles.pillStale
                    }`}
                  >
                    {device.status}
                  </span>
                </span>
              </div>
            )}

            {device.batteryLevel != null && (
              <div className={styles.row}>
                <span className={styles.label}>Battery</span>
                <span className={styles.value}>
                  <span className={styles.batteryRow}>
                    <span className={styles.batteryBar}>
                      <span
                        className={styles.batteryFill}
                        style={{ width: `${Math.min(100, Math.max(0, device.batteryLevel))}%` }}
                      />
                    </span>
                    <span className={styles.batteryLabel}>{device.batteryLevel}%</span>
                  </span>
                </span>
              </div>
            )}

            {pairedDate && (
              <div className={styles.row}>
                <span className={styles.label}>Paired</span>
                <span className={styles.value}>
                  <time dateTime={device.pairedDate}>{pairedDate}</time>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
