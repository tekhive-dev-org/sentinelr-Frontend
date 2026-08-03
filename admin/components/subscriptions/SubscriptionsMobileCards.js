import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import styles from './SubscriptionsMobileCards.module.css';

const STATUS_LABELS = {
  active: 'Active',
  trial: 'Trial',
  pastDue: 'Past Due',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const PLAN_LABELS = {
  freemium: 'Freemium',
  personal: 'Personal',
  family: 'Family',
  premium: 'Premium',
};

function formatCurrency(amount, currency) {
  if (amount == null) return '—';
  const symbol = currency === 'usd' ? '$' : currency || '$';
  return `${symbol}${Number(amount).toFixed(2)}`;
}

function formatRenewal(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.subscriberIcon}>
        <div className={styles.skeleton} style={{ width: 24, height: 24 }} />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.skeleton} style={{ width: 120, height: 16, marginBottom: 6 }} />
        <div className={styles.skeleton} style={{ width: 160, height: 12, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 80, height: 12, marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ width: 60, height: 22, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function SubscriptionsMobileCards({
  subscriptions,
  isLoading,
  error,
  onSubscriptionClick,
}) {
  const handleCardClick = useCallback(
    (subscription) => {
      onSubscriptionClick(subscription);
    },
    [onSubscriptionClick],
  );

  const statusKey = (status) => (status || 'active').toLowerCase();

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

      {!isLoading && !error && subscriptions.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No subscriptions match your filters</p>
          <p className={styles.emptyDesc}>
            Try adjusting your search criteria or clearing the filters above.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        subscriptions.map((subscription) => {
          const st = statusKey(subscription.status);
          const isPastDue = st === 'pastdue';
          const planLabel = PLAN_LABELS[subscription.plan?.toLowerCase()] || subscription.plan || '—';

          return (
            <div
              key={subscription.id}
              className={isPastDue ? styles.cardPastDue : styles.card}
              onClick={() => handleCardClick(subscription)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(subscription);
              }}
            >
              <div className={styles.subscriberIcon}>
                <PersonOutlinedIcon className={styles.subscriberIconSvg} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.subscriberName}>
                    {subscription.subscriber || 'Unknown'}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status${st.charAt(0).toUpperCase() + st.slice(1)}`]
                    }`}
                  >
                    {STATUS_LABELS[st] || subscription.status}
                  </span>
                </div>
                <span className={styles.emailText}>
                  {subscription.email || 'No email'}
                </span>
                <span className={styles.planText}>
                  {planLabel}
                </span>
                <div className={styles.cardBottom}>
                  <span className={styles.amountText}>
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </span>
                  <span className={styles.renewalText}>
                    {subscription.renewal
                      ? `Renews: ${formatRenewal(subscription.renewal)}`
                      : 'No renewal'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
