import SectionCard from '../users/SectionCard';
import WifiIcon from '@mui/icons-material/Wifi';
import styles from './DeviceDetailConnection.module.css';

const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Returns a human-friendly relative time string ("2h ago", "just now", etc.)
 */
function relativeTime(dateStr) {
  if (!dateStr) return null;

  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;

  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Masks the last octet of an IPv4 address.
 * Example: "192.168.1.42" → "192.168.1.***"
 */
function maskIp(ip) {
  if (!ip) return null;
  const parts = ip.split('.');
  if (parts.length === 4) {
    parts[3] = '***';
    return parts.join('.');
  }
  // For IPv6 or other formats, mask the last segment
  const lastColon = ip.lastIndexOf(':');
  if (lastColon !== -1) {
    return ip.slice(0, lastColon + 1) + '****';
  }
  return ip;
}

export default function DeviceDetailConnection({ device, isLoading }) {
  const isEmpty = !device;
  const lastSeen = device?.lastSeen ? new Date(device.lastSeen).getTime() : null;
  const isStale =
    lastSeen != null && Date.now() - lastSeen > STALE_THRESHOLD_MS;

  return (
    <SectionCard
      title="Connection"
      icon={WifiIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="Connection data unavailable"
    >
      {device && (
        <div className={styles.content}>
          {isStale && (
            <span
              className={styles.stalePill}
              role="status"
            >
              No recent connection
            </span>
          )}

          <div className={styles.rows}>
            {device.lastSeen && (
              <div className={styles.row}>
                <span className={styles.label}>Last Seen</span>
                <span className={styles.value}>
                  <time dateTime={device.lastSeen}>
                    {relativeTime(device.lastSeen)}
                  </time>
                  <span className={styles.metaTime}>
                    {new Date(device.lastSeen).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>
            )}

            {device.connectionType && (
              <div className={styles.row}>
                <span className={styles.label}>Connection</span>
                <span className={styles.value}>{device.connectionType}</span>
              </div>
            )}

            {device.ipAddress && (
              <div className={styles.row}>
                <span className={styles.label}>IP Address</span>
                <span className={styles.value}>
                  <code className={styles.ipCode}>{maskIp(device.ipAddress)}</code>
                </span>
              </div>
            )}

            {device.networkType && (
              <div className={styles.row}>
                <span className={styles.label}>Network</span>
                <span className={styles.value}>{device.networkType}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
