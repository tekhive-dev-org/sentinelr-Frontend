import SectionCard from './SectionCard';
import DevicesIcon from '@mui/icons-material/Devices';
import styles from './UserDetailDevices.module.css';

export default function UserDetailDevices({ devices, isLoading }) {
  const isEmpty = !devices || devices.length === 0;

  return (
    <SectionCard
      title="Connected Devices"
      icon={DevicesIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No connected devices"
    >
      {!isEmpty && (
        <ul className={styles.list}>
          {devices.map((device) => (
            <li key={device.id} className={styles.row}>
              <div className={styles.rowPrimary}>
                <span className={styles.deviceName}>{device.name}</span>
                <span className={styles.deviceType}>{device.type}</span>
              </div>
              <div className={styles.rowSecondary}>
                {device.os && <span className={styles.meta}>{device.os}</span>}
                {device.lastSeen && (
                  <span className={styles.meta}>
                    Last seen:{' '}
                    {new Date(device.lastSeen).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
                {device.battery != null && (
                  <span className={styles.meta}>Battery: {device.battery}%</span>
                )}
                <span
                  className={`${styles.pairStatus} ${
                    device.isPaired ? styles.paired : styles.unpaired
                  }`}
                >
                  {device.isPaired ? 'Paired' : 'Unpaired'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
