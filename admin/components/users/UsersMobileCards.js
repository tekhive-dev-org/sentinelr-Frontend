import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import styles from './UsersMobileCards.module.css';

const STATUS_COLORS = {
  active: 'green',
  blocked: 'red',
  flagged: 'yellow',
  suspended: 'orange',
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.skeleton} style={{ width: 48, height: 48, borderRadius: '50%' }} />
        <div className={styles.cardMeta}>
          <div className={styles.skeleton} style={{ width: 120, height: 16, marginBottom: 6 }} />
          <div className={styles.skeleton} style={{ width: 80, height: 12 }} />
        </div>
      </div>
      <div className={styles.skeleton} style={{ width: 60, height: 22, borderRadius: 999, marginTop: 8 }} />
    </div>
  );
}

export default function UsersMobileCards({
  users,
  isLoading,
  error,
  selectedIds,
  onToggleSelect,
  onUserClick,
}) {
  const handleCardClick = useCallback(
    (user) => {
      onUserClick(user);
    },
    [onUserClick],
  );

  const handleCheckboxClick = useCallback(
    (e, userId) => {
      e.stopPropagation();
      onToggleSelect(userId);
    },
    [onToggleSelect],
  );

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.errorBanner} role="alert">
          <ErrorOutlineIcon className={styles.errorIcon} />
          <span className={styles.errorText}>{error}</span>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            <ReplayIcon className={styles.retryIcon} />
            Retry
          </button>
        </div>
      )}

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`skel-card-${i}`} />)}

      {!isLoading && !error && users.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No users match your filters</p>
          <p className={styles.emptyDesc}>
            Try adjusting your search criteria or clearing the filters above.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        users.map((user) => {
          const isSelected = selectedIds.has(user.id);
          const statusColor = STATUS_COLORS[user.status] || 'green';

          return (
            <div
              key={user.id}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => handleCardClick(user)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(user);
              }}
            >
              <div className={styles.cardCheck}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isSelected}
                  onChange={(e) => handleCheckboxClick(e, user.id)}
                  aria-label={`Select ${user.name}`}
                />
              </div>
              <div className={styles.avatar}>{getInitials(user.name)}</div>
              <div className={styles.cardInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
                <div className={styles.cardBottom}>
                  <span className={styles.roleText}>
                    {user.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : '—'}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status${statusColor.charAt(0).toUpperCase() + statusColor.slice(1)}`]
                    }`}
                  >
                    {user.status
                      ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
