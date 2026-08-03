import SectionCard from './SectionCard';
import PersonIcon from '@mui/icons-material/Person';
import styles from './UserDetailProfile.module.css';

export default function UserDetailProfile({ user, isLoading }) {
  const isEmpty = !user;

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?'
    : '';

  const memberSince = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <SectionCard
      title="Profile"
      icon={PersonIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="Profile information unavailable"
    >
      {user && (
        <div className={styles.content}>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>{initials}</span>
          </div>

          <div className={styles.details}>
            <h4 className={styles.name}>{user.firstName} {user.lastName}</h4>

            {user.email && (
              <div className={styles.row}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{user.email}</span>
              </div>
            )}

            {user.phone && (
              <div className={styles.row}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value}>{user.phone}</span>
              </div>
            )}

            {user.role && (
              <div className={styles.row}>
                <span className={styles.label}>Role</span>
                <span className={styles.value}>{user.role}</span>
              </div>
            )}

            {user.accountType && (
              <div className={styles.row}>
                <span className={styles.label}>Account Type</span>
                <span className={styles.value}>{user.accountType}</span>
              </div>
            )}

            {memberSince && (
              <div className={styles.row}>
                <span className={styles.label}>Member Since</span>
                <span className={styles.value}>{memberSince}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
