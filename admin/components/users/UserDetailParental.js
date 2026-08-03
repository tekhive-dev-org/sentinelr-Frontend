import SectionCard from './SectionCard';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import styles from './UserDetailParental.module.css';

export default function UserDetailParental({ controls, isLoading }) {
  const isEmpty = !controls;

  return (
    <SectionCard
      title="Parental Controls"
      icon={FamilyRestroomIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No parental controls configured"
    >
      {controls && (
        <div className={styles.content}>
          <div className={styles.row}>
            <span className={styles.label}>Monitoring</span>
            <span
              className={`${styles.status} ${
                controls.isMonitoringActive
                  ? styles.statusOn
                  : styles.statusOff
              }`}
            >
              {controls.isMonitoringActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {controls.screenTimeLimit != null && (
            <div className={styles.row}>
              <span className={styles.label}>Screen Time Limit</span>
              <span className={styles.value}>
                {controls.screenTimeLimit} min/day
              </span>
            </div>
          )}

          {controls.appBlockingCount != null && (
            <div className={styles.row}>
              <span className={styles.label}>Apps Blocked</span>
              <span className={styles.value}>
                {controls.appBlockingCount} app
                {controls.appBlockingCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {controls.webFiltering != null && (
            <div className={styles.row}>
              <span className={styles.label}>Web Filtering</span>
              <span
                className={`${styles.status} ${
                  controls.webFiltering ? styles.statusOn : styles.statusOff
                }`}
              >
                {controls.webFiltering ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
