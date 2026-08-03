import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getInitials } from '../../utils/teamAdapters';
import styles from './TeamMobileCards.module.css';

const statusClass = {
  active: styles.pillActive,
  invited: styles.pillInvited,
  suspended: styles.pillSuspended,
  deactivated: styles.pillDeactivated,
};

function SkeletonCards() {
  return Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className={`${styles.card} ${styles.skeleton}`}>
      <div className={styles.skeletonCircle} />
      <div className={styles.info}>
        <div className={`${styles.skeletonLine} mb-2 w-32`} />
        <div className={`${styles.skeletonLine} w-48`} />
        <div className="mt-2 flex gap-2">
          <div className={`${styles.skeletonLine} w-16`} />
          <div className={`${styles.skeletonLine} w-14`} />
        </div>
      </div>
    </div>
  ));
}

export default function TeamMobileCards({ admins = [], isLoading, error, onAdminClick }) {
  if (isLoading) {
    return <div className={styles.grid}><SkeletonCards /></div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!admins.length) {
    return <div className={styles.empty}>No admins found.</div>;
  }

  return (
    <div className={styles.grid}>
      {admins.map((admin) => (
        <div
          key={admin.id}
          className={styles.card}
          onClick={() => onAdminClick?.(admin)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onAdminClick?.(admin); }}
        >
          <div className={styles.avatar}>{getInitials(admin.name)}</div>
          <div className={styles.info}>
            <div className={styles.name}>{admin.name}</div>
            <div className={styles.email}>{admin.email}</div>
            <div className={styles.meta}>
              {admin.roles?.map((role) => (
                <span key={role} className={styles.rolePill}>{role}</span>
              ))}
              <span className={`${styles.pill} ${statusClass[admin.status] || styles.pillDeactivated}`}>
                {admin.statusLabel}
              </span>
            </div>
          </div>
          <ChevronRightIcon className={styles.chevron} />
        </div>
      ))}
    </div>
  );
}
