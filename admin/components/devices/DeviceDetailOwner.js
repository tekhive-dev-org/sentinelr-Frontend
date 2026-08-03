import Link from 'next/link';
import SectionCard from '../users/SectionCard';
import PersonIcon from '@mui/icons-material/Person';
import styles from './DeviceDetailOwner.module.css';

export default function DeviceDetailOwner({ device, isLoading }) {
  const isEmpty = !device;
  const owner = device?.owner;

  return (
    <SectionCard
      title="Owner"
      icon={PersonIcon}
      isLoading={isLoading}
      isEmpty={isEmpty || !owner}
      emptyText="Owner information unavailable"
    >
      {owner && (
        <div className={styles.content}>
          <div className={styles.rows}>
            {owner.name && (
              <div className={styles.row}>
                <span className={styles.label}>Name</span>
                <span className={styles.value}>
                  {owner.id ? (
                    <Link
                      href={`/dashboard/users/${owner.id}`}
                      className={styles.link}
                    >
                      {owner.name}
                    </Link>
                  ) : (
                    owner.name
                  )}
                </span>
              </div>
            )}

            {owner.email && (
              <div className={styles.row}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{owner.email}</span>
              </div>
            )}

            {owner.familyName && (
              <div className={styles.row}>
                <span className={styles.label}>Family</span>
                <span className={styles.value}>
                  <button
                    type="button"
                    className={styles.link}
                    tabIndex={0}
                  >
                    {owner.familyName}
                  </button>
                </span>
              </div>
            )}

            {owner.relationship && (
              <div className={styles.row}>
                <span className={styles.label}>Relationship</span>
                <span className={styles.value}>{owner.relationship}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
