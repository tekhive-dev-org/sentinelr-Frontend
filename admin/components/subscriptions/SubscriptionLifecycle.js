import SectionCard from '../users/SectionCard';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import styles from './SubscriptionLifecycle.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Derives timeline nodes from a subscription object.
 * Each node: { key, label, date, meta?, nodeStyle }
 */
function deriveTimelineNodes(subscription) {
  if (!subscription) return [];

  const nodes = [];
  const status = subscription.status;

  // 1. Started
  nodes.push({
    key: 'started',
    label: 'Subscription Started',
    date: subscription.startedOn,
    nodeStyle: styles.nodeCompleted,
  });

  // 2. Trial if applicable
  if (subscription.trialStartedOn) {
    nodes.push({
      key: 'trial-started',
      label: 'Trial Started',
      date: subscription.trialStartedOn,
      nodeStyle: styles.nodeTrial,
    });
  }

  if (subscription.trialEndedOn) {
    nodes.push({
      key: 'trial-ended',
      label: 'Trial Ended',
      date: subscription.trialEndedOn,
      meta:
        subscription.trialConverted ? 'Converted to paid' : 'Not converted',
      nodeStyle: styles.nodeCompleted,
    });
  }

  // 3. Renewals
  if (Array.isArray(subscription.renewals) && subscription.renewals.length > 0) {
    subscription.renewals.forEach((renewal, idx) => {
      nodes.push({
        key: `renewal-${idx}`,
        label: `Renewal ${idx + 1}`,
        date: renewal.date,
        meta: renewal.amount != null
          ? `${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: (renewal.currency || 'USD').toUpperCase(),
            }).format(renewal.amount)}`
          : null,
        nodeStyle: styles.nodeCompleted,
      });
    });
  }

  // 4. Current period
  if (status === 'active' || status === 'trialing' || status === 'past_due') {
    nodes.push({
      key: 'current-period',
      label: 'Current Period',
      date: subscription.currentPeriodStart,
      meta: subscription.currentPeriodEnd
        ? `Ends ${formatDate(subscription.currentPeriodEnd)}`
        : null,
      nodeStyle:
        status === 'past_due' ? styles.nodeCancelled : styles.nodeActive,
    });
  }

  // 5. Cancelled / Expired
  if (status === 'cancelled') {
    nodes.push({
      key: 'cancelled',
      label: 'Cancelled',
      date: subscription.cancelledAt,
      meta: subscription.cancelReason
        ? `Reason: ${subscription.cancelReason}`
        : null,
      nodeStyle: styles.nodeCancelled,
    });
  } else if (status === 'expired') {
    nodes.push({
      key: 'expired',
      label: 'Expired',
      date: subscription.expiredAt,
      nodeStyle: styles.nodeExpired,
    });
  }

  return nodes;
}

export default function SubscriptionLifecycle({ subscription, isLoading }) {
  const isEmpty = !subscription;
  const nodes = deriveTimelineNodes(subscription);

  return (
    <SectionCard
      title="Lifecycle"
      icon={TimelineOutlinedIcon}
      isLoading={isLoading}
      isEmpty={isEmpty || nodes.length === 0}
      emptyText="No lifecycle data available"
    >
      {nodes.length > 0 && (
        <div className={styles.timeline}>
          {nodes.map((node) => (
            <div key={node.key} className={`${styles.node} ${node.nodeStyle || ''}`}>
              <span className={styles.eventLabel}>{node.label}</span>
              <span className={styles.eventDate}>
                {formatDate(node.date)}
              </span>
              {node.meta && (
                <span className={styles.eventMeta}>{node.meta}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
