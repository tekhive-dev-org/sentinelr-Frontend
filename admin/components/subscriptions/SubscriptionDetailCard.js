import Link from 'next/link';
import SectionCard from '../users/SectionCard';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import styles from './SubscriptionDetailCard.module.css';

const STATUS_STYLE = {
  active: styles.statusActive,
  trialing: styles.statusTrialing,
  past_due: styles.statusPastDue,
  cancelled: styles.statusCancelled,
  expired: styles.statusExpired,
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Returns a human-readable countdown label for the renewal date.
 * e.g. "14 days", "Tomorrow", "Today", "Overdue by 3 days"
 */
function getCountdownLabel(renewalDateStr) {
  if (!renewalDateStr) return null;
  const now = new Date();
  const renewal = new Date(renewalDateStr);
  const diffMs = renewal.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)} days`, urgent: true };
  }
  if (diffDays === 0) {
    return { text: 'Today', urgent: true };
  }
  if (diffDays === 1) {
    return { text: 'Tomorrow', urgent: false };
  }
  return { text: `${diffDays} days`, urgent: diffDays <= 7 };
}

function formatAmount(subscription) {
  if (!subscription) return null;
  const { amount, currency, billingPeriod } = subscription;
  if (amount == null) return null;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);

  return billingPeriod
    ? `${formatted} / ${billingPeriod}`
    : formatted;
}

export default function SubscriptionDetailCard({ subscription, isLoading }) {
  const isEmpty = !subscription;
  const isPastDue = subscription?.status === 'past_due';
  const isCancelled = subscription?.status === 'cancelled';

  const renewalDate = formatDate(subscription?.renewalDate);
  const startedDate = formatDate(subscription?.startedOn);
  const countdown = getCountdownLabel(subscription?.renewalDate);
  const amountLabel = formatAmount(subscription);
  const statusClass = STATUS_STYLE[subscription?.status] || '';

  // Loading skeleton
  if (isLoading) {
    return (
      <section className={styles.skeletonGroup} aria-busy="true">
        <span className={styles.skeletonLine} />
        <span className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
        <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        <span className={styles.skeletonLine} />
        <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
      </section>
    );
  }

  // Custom card wrapper for past_due / cancelled border styling
  if (isPastDue) {
    return (
      <section className={styles.cardPastDue}>
        <header className="flex items-center gap-2 border-b border-red-100 px-5 py-4">
          <ReceiptLongOutlinedIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Subscription
          </h3>
        </header>
        <div className="px-5 py-4">
          <SubscriptionBody
            subscription={subscription}
            isEmpty={isEmpty}
            statusClass={statusClass}
            startedDate={startedDate}
            renewalDate={renewalDate}
            amountLabel={amountLabel}
            countdown={countdown}
          />
        </div>
      </section>
    );
  }

  if (isCancelled) {
    return (
      <section className={styles.cardCancelled}>
        <header className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <ReceiptLongOutlinedIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Subscription
          </h3>
        </header>
        <div className={`px-5 py-4 ${styles.cancelledOverlay}`}>
          <SubscriptionBody
            subscription={subscription}
            isEmpty={isEmpty}
            statusClass={statusClass}
            startedDate={startedDate}
            renewalDate={renewalDate}
            amountLabel={amountLabel}
            countdown={countdown}
          />
        </div>
      </section>
    );
  }

  return (
    <SectionCard
      title="Subscription"
      icon={ReceiptLongOutlinedIcon}
      isLoading={false}
      isEmpty={isEmpty}
      emptyText="No subscription data available"
    >
      <SubscriptionBody
        subscription={subscription}
        isEmpty={isEmpty}
        statusClass={statusClass}
        startedDate={startedDate}
        renewalDate={renewalDate}
        amountLabel={amountLabel}
        countdown={countdown}
      />
    </SectionCard>
  );
}

function SubscriptionBody({
  subscription,
  isEmpty,
  statusClass,
  startedDate,
  renewalDate,
  amountLabel,
  countdown,
}) {
  if (isEmpty) return null;

  return (
    <div className={styles.content}>
      {/* Subscriber name + email */}
      <div className={styles.topRow}>
        <div className={styles.userInfo}>
          {subscription.subscriberId && (
            <Link
              href={`/dashboard/users/${subscription.subscriberId}`}
              className={styles.subscriberName}
            >
              {subscription.subscriberName || 'Unknown Subscriber'}
            </Link>
          )}
          {subscription.email && (
            <span className={styles.email}>{subscription.email}</span>
          )}
        </div>
      </div>

      {/* Plan name + status pill */}
      <div className={styles.planRow}>
        <span className={styles.planName}>{subscription.planName}</span>
        {statusClass && (
          <span className={`${styles.statusPill} ${statusClass}`}>
            {subscription.status?.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Details */}
      <div className={styles.details}>
        {amountLabel && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Amount</span>
            <span className={styles.amount}>{amountLabel}</span>
          </div>
        )}
        {startedDate && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Started</span>
            <span className={styles.detailValue}>{startedDate}</span>
          </div>
        )}
        {renewalDate && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Renewal</span>
            <span className={styles.detailValue}>
              {renewalDate}
              {countdown && (
                <span
                  className={
                    countdown.urgent
                      ? styles.countdownLabelUrgent
                      : styles.countdownLabel
                  }
                >
                  ({countdown.text})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Trial info banner */}
      {subscription.status === 'trialing' && subscription.trialEndsOn && (
        <div className={styles.trialBanner}>
          Trial ends on{' '}
          {formatDate(subscription.trialEndsOn) || subscription.trialEndsOn}.
          {subscription.trialDaysLeft != null &&
            ` ${subscription.trialDaysLeft} day${subscription.trialDaysLeft === 1 ? '' : 's'} remaining.`}
        </div>
      )}
    </div>
  );
}
