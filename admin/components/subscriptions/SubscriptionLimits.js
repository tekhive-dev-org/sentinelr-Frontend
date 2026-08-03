import SectionCard from '../users/SectionCard';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import styles from './SubscriptionLimits.module.css';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isExpired(expiryDateStr) {
  if (!expiryDateStr) return false;
  return new Date(expiryDateStr).getTime() < Date.now();
}

export default function SubscriptionLimits({ subscription, isLoading }) {
  const isEmpty = !subscription;
  const hasLimits =
    subscription?.deviceLimit != null ||
    subscription?.memberLimit != null ||
    (Array.isArray(subscription?.manualEntitlements) &&
      subscription.manualEntitlements.length > 0);

  return (
    <SectionCard
      title="Limits &amp; Entitlements"
      icon={TuneOutlinedIcon}
      isLoading={isLoading}
      isEmpty={isEmpty || !hasLimits}
      emptyText="No limit information available"
    >
      {hasLimits && (
        <div className={styles.content}>
          {/* Device limit */}
          {subscription.deviceLimit != null && (
            <div className={styles.limitGroup}>
              <span className={styles.limitGroupLabel}>Device Limit</span>
              <div className={styles.limitRow}>
                <span className={styles.limitLabel}>Max devices</span>
                <span className={styles.limitValue}>
                  {subscription.deviceLimit}
                  {subscription.devicesUsed != null && (
                    <span className={styles.limitUsed}>
                      ({subscription.devicesUsed} used)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Member / family limit */}
          {subscription.memberLimit != null && (
            <div className={styles.limitGroup}>
              <span className={styles.limitGroupLabel}>Member Limit</span>
              <div className={styles.limitRow}>
                <span className={styles.limitLabel}>Max members</span>
                <span className={styles.limitValue}>
                  {subscription.memberLimit}
                  {subscription.membersUsed != null && (
                    <span className={styles.limitUsed}>
                      ({subscription.membersUsed} used)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Manual entitlements */}
          {Array.isArray(subscription.manualEntitlements) &&
            subscription.manualEntitlements.length > 0 && (
              <div className={styles.limitGroup}>
                <span className={styles.limitGroupLabel}>
                  Manual Entitlements
                </span>
                {subscription.manualEntitlements.map((entitlement, idx) => {
                  const expired = entitlement.expiresAt
                    ? isExpired(entitlement.expiresAt)
                    : false;
                  return (
                    <div
                      key={entitlement.id || idx}
                      className={styles.entitlementCard}
                    >
                      <div className={styles.entitlementHeader}>
                        <span className={styles.entitlementName}>
                          {entitlement.name || entitlement.feature || `Entitlement ${idx + 1}`}
                        </span>
                        {entitlement.expiresAt && (
                          <span
                            className={
                              expired
                                ? styles.entitlementExpired
                                : styles.entitlementExpiry
                            }
                          >
                            {expired ? 'Expired ' : 'Expires '}
                            {formatDate(entitlement.expiresAt)}
                          </span>
                        )}
                      </div>
                      {entitlement.value != null && (
                        <span className="text-xs text-slate-500">
                          Value: {entitlement.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      )}
    </SectionCard>
  );
}
