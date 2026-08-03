import SectionCard from './SectionCard';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import styles from './UserDetailGeofences.module.css';

export default function UserDetailGeofences({ geofences, isLoading }) {
  const isEmpty = !geofences || geofences.length === 0;

  return (
    <SectionCard
      title="Geofence Zones"
      icon={FmdGoodIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No geofence zones"
    >
      {!isEmpty && (
        <ul className={styles.list}>
          {geofences.map((zone) => (
            <li key={zone.id} className={styles.row}>
              <div className={styles.rowInfo}>
                <span className={styles.zoneName}>{zone.name}</span>
                {zone.type && (
                  <span className={styles.zoneType}>{zone.type}</span>
                )}
              </div>
              <span
                className={`${styles.activeBadge} ${
                  zone.isActive ? styles.active : styles.inactive
                }`}
              >
                {zone.isActive ? 'Active' : 'Inactive'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
