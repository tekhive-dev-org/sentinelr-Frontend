import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import styles from './SupportMobileCards.module.css';

const CATEGORY_LABELS = {
  device: 'Device',
  alerts: 'Alerts',
  billing: 'Billing',
  technical: 'Technical',
  feedback: 'Feedback',
};

const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const STATUS_LABELS = {
  open: 'Open',
  inProgress: 'In Progress',
  resolved: 'Resolved',
};

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.skeleton} style={{ width: 140, height: 16, marginBottom: 6 }} />
        <div className={styles.skeleton} style={{ width: 90, height: 12, marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999, marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} />
        <div className={styles.skeleton} style={{ width: 72, height: 12, marginTop: 8 }} />
      </div>
    </div>
  );
}

export default function SupportMobileCards({
  tickets,
  isLoading,
  error,
  onTicketClick,
}) {
  const handleCardClick = useCallback(
    (ticket) => {
      onTicketClick(ticket);
    },
    [onTicketClick],
  );

  const categoryKey = (cat) => (cat || 'device').toLowerCase();
  const priorityKey = (pri) => (pri || 'low').toLowerCase();
  const statusKey = (st) => (st || 'open').toLowerCase();

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

      {!isLoading && !error && tickets.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No tickets match your filters</p>
          <p className={styles.emptyDesc}>
            Try adjusting your search criteria or clearing the filters above.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        tickets.map((ticket) => {
          const cat = categoryKey(ticket.category);
          const pri = priorityKey(ticket.priority);
          const st = statusKey(ticket.status);

          return (
            <div
              key={ticket.id}
              className={styles.card}
              onClick={() => handleCardClick(ticket)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(ticket);
              }}
            >
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.subjectText}>{ticket.subject || 'Untitled'}</span>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status${st.charAt(0).toUpperCase() + st.slice(1)}`]
                    }`}
                  >
                    {STATUS_LABELS[st] || ticket.status}
                  </span>
                </div>
                <span className={styles.userText}>
                  {ticket.user ? `User: ${ticket.user}` : 'No user'}
                </span>
                <div className={styles.badgeRow}>
                  <span
                    className={`${styles.categoryBadge} ${
                      styles[`category${cat.charAt(0).toUpperCase() + cat.slice(1)}`]
                    }`}
                  >
                    {CATEGORY_LABELS[cat] || ticket.category}
                  </span>
                  <span
                    className={`${styles.priorityBadge} ${
                      styles[`priority${pri.charAt(0).toUpperCase() + pri.slice(1)}`]
                    }`}
                  >
                    {PRIORITY_LABELS[pri] || ticket.priority}
                  </span>
                </div>
                <div className={styles.cardBottom}>
                  <span className={styles.dateText}>{formatRelativeTime(ticket.created)}</span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
