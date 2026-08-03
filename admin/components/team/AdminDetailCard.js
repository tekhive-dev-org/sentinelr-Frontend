import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import VerifiedIcon from '@mui/icons-material/Verified';
import { getInitials } from '../../utils/teamAdapters';
import styles from './AdminDetailCard.module.css';

const statusClass = {
  active: styles.pillActive,
  invited: styles.pillInvited,
  suspended: styles.pillSuspended,
  deactivated: styles.pillDeactivated,
};

export default function AdminDetailCard({ admin, isLoading }) {
  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.skeleton}`}>
        <div className={styles.header}>
          <div className="mx-auto h-20 w-20 rounded-full bg-slate-200" />
          <div className="mx-auto mt-4 h-6 w-32 rounded bg-slate-200" />
          <div className="mx-auto mt-2 h-4 w-48 rounded bg-slate-200" />
        </div>
        <div className={styles.divider} />
        <div className={styles.details}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.detailRow}>
              <div className="h-3 w-16 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className={styles.card}>
        <p className="py-8 text-center text-sm text-slate-500">Select an admin to view details.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>{getInitials(admin.name)}</div>
        <h2 className={styles.name}>{admin.name}</h2>
        <p className={styles.email}>{admin.email}</p>

        <div className={styles.badges}>
          <span className={`${styles.pill} ${statusClass[admin.status] || styles.pillDeactivated}`}>
            {admin.statusLabel}
          </span>
          {admin.roles?.includes('super_admin') && (
            <span className={styles.superAdminBadge}>
              <VerifiedIcon className={styles.superAdminIcon} fontSize="inherit" />
              Super Admin
            </span>
          )}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>MFA</span>
          {admin.mfaEnabled ? (
            <span className={styles.mfaEnabled}>
              <CheckCircleIcon className={styles.mfaIcon} fontSize="inherit" /> Enabled
            </span>
          ) : (
            <span className={styles.mfaDisabled}>
              <DoNotDisturbAltIcon className={styles.mfaIcon} fontSize="inherit" /> Disabled
            </span>
          )}
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Last Active</span>
          <span className={styles.detailValue}>{admin.lastActive}</span>
        </div>

        {admin.invitedAt && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Invited</span>
            <span className={styles.detailValue}>{admin.invitedAt}</span>
          </div>
        )}

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>ID</span>
          <span className={`${styles.detailValue} truncate max-w-[180px]`}>{admin.id}</span>
        </div>
      </div>
    </div>
  );
}
