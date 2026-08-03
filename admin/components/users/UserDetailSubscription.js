import SectionCard from './SectionCard';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import styles from './UserDetailSubscription.module.css';

export default function UserDetailSubscription({ subscription, isLoading }) {
  const isEmpty = !subscription;

  const startedOn = subscription?.startedOn
    ? new Date(subscription.startedOn).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const endsOn = subscription?.endsOn
    ? new Date(subscription.endsOn).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <SectionCard
      title="Subscription"
      icon={CardMembershipIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No active subscription"
    >
      {subscription && (
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.planName}>{subscription.planName}</span>
            <span
              className={`${styles.status} ${
                subscription.status === 'active'
                  ? styles.statusActive
                  : subscription.status === 'past_due'
                  ? styles.statusPastDue
                  : styles.statusInactive
              }`}
            >
              {subscription.status}
            </span>
          </div>

          <div className={styles.details}>
            {startedOn && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Started</span>
                <span className={styles.detailValue}>{startedOn}</span>
              </div>
            )}
            {endsOn && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Ends</span>
                <span className={styles.detailValue}>{endsOn}</span>
              </div>
            )}
            {subscription.paymentMethod && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Payment</span>
                <span className={styles.detailValue}>
                  {subscription.paymentMethod}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
