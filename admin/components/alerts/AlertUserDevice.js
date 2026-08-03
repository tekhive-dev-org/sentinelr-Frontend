import SectionCard from '../users/SectionCard';
import DevicesIcon from '@mui/icons-material/Devices';
import styles from './AlertUserDevice.module.css';

export default function AlertUserDevice({ alert, isLoading }) {
  const isEmpty = !alert || (!alert.user && !alert.device);

  return (
    <SectionCard
      title="User & Device"
      icon={DevicesIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No user or device data available"
    >
      <div className={styles.grid}>
        {/* User Column */}
        <div className={styles.column}>
          <span className={styles.columnLabel}>User</span>
          {alert.user ? (
            <div className={styles.detailGroup}>
              <div className={styles.detailRow}>
                <a
                  href={`/dashboard/users/${alert.user.id}`}
                  className={styles.link}
                >
                  {alert.user.name || '—'}
                </a>
              </div>
              {alert.user.email && (
                <span className={styles.meta}>{alert.user.email}</span>
              )}
            </div>
          ) : (
            <span className={styles.meta}>No user linked</span>
          )}
        </div>

        {/* Device Column */}
        <div className={styles.column}>
          <span className={styles.columnLabel}>Device</span>
          {alert.device ? (
            <div className={styles.detailGroup}>
              <div className={styles.detailRow}>
                <a
                  href={`/dashboard/devices/${alert.device.id}`}
                  className={styles.link}
                >
                  {alert.device.name || '—'}
                </a>
              </div>
              {alert.device.platform && (
                <span className={styles.meta}>
                  {alert.device.platform}
                  {alert.device.battery != null &&
                    ` · ${alert.device.battery}%`}
                </span>
              )}
              {alert.device.lastSeen && (
                <span className={styles.meta}>
                  Last seen:{' '}
                  {new Date(alert.device.lastSeen).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          ) : (
            <span className={styles.meta}>No device linked</span>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
