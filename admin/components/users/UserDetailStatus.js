import SectionCard from './SectionCard';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import styles from './UserDetailStatus.module.css';

export default function UserDetailStatus({ user, isLoading }) {
  const isEmpty = !user;

  const verifiedOn = user?.verifiedOn
    ? new Date(user.verifiedOn).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const statusChangedOn = user?.statusChangedOn
    ? new Date(user.statusChangedOn).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  if (!isLoading && !isEmpty) {
    return (
      <SectionCard
        title="Status"
        icon={VerifiedUserIcon}
        isLoading={isLoading}
        isEmpty={false}
      >
        <div className={styles.content}>
          <div className={styles.pills}>
            <span
              className={`${styles.pill} ${
                user.isVerified ? styles.pillVerified : styles.pillUnverified
              }`}
            >
              {user.isVerified ? 'Verified' : 'Not Verified'}
            </span>

            {user.isBlocked && (
              <span className={`${styles.pill} ${styles.pillBlocked}`}>
                Blocked
              </span>
            )}

            {user.isSuspended && (
              <span className={`${styles.pill} ${styles.pillSuspended}`}>
                Suspended
              </span>
            )}

            {!user.isBlocked && !user.isSuspended && (
              <span className={`${styles.pill} ${styles.pillActive}`}>
                Active
              </span>
            )}
          </div>

          <div className={styles.timestamps}>
            {verifiedOn && (
              <p className={styles.timestamp}>
                <span className={styles.timestampLabel}>Verified on:</span>{' '}
                {verifiedOn}
              </p>
            )}
            {statusChangedOn && (
              <p className={styles.timestamp}>
                <span className={styles.timestampLabel}>Status changed:</span>{' '}
                {statusChangedOn}
              </p>
            )}
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Status"
      icon={VerifiedUserIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="Status information unavailable"
    />
  );
}
