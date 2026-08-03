import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import styles from './SubscriptionActions.module.css';

/**
 * Defines available action groups and items.
 * Each item: { key, label, Icon, danger?, warning? }
 */
const ACTION_GROUPS = [
  {
    key: 'plan',
    label: 'Plan Management',
    items: [
      {
        key: 'change-plan',
        label: 'Change Plan',
        Icon: SwapHorizOutlinedIcon,
      },
    ],
  },
  {
    key: 'cancellation',
    label: 'Cancellation',
    items: [
      {
        key: 'cancel-period-end',
        label: 'Cancel at Period End',
        Icon: EventBusyOutlinedIcon,
        warning: true,
      },
      {
        key: 'cancel-immediately',
        label: 'Cancel Immediately',
        Icon: CancelOutlinedIcon,
        danger: true,
      },
    ],
  },
  {
    key: 'entitlements',
    label: 'Entitlements',
    items: [
      {
        key: 'apply-manual-entitlement',
        label: 'Apply Manual Entitlement',
        Icon: CardGiftcardOutlinedIcon,
      },
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    items: [
      {
        key: 'record-offline-payment',
        label: 'Record Offline Payment',
        Icon: AccountBalanceWalletOutlinedIcon,
        tooltip: 'Only if authorized',
      },
    ],
  },
  {
    key: 'trial',
    label: 'Trial',
    items: [
      {
        key: 'extend-trial',
        label: 'Extend Trial',
        Icon: CalendarTodayOutlinedIcon,
      },
    ],
  },
  {
    key: 'reactivation',
    label: 'Reactivation',
    items: [
      {
        key: 'reactivate',
        label: 'Reactivate',
        Icon: RestoreOutlinedIcon,
      },
    ],
  },
];

/**
 * Determines which action keys are available based on subscription status.
 */
function getVisibleActionKeys(status) {
  switch (status) {
    case 'active':
      return new Set([
        'change-plan',
        'cancel-period-end',
        'cancel-immediately',
        'apply-manual-entitlement',
        'record-offline-payment',
      ]);
    case 'trialing':
      return new Set([
        'extend-trial',
        'change-plan',
        'cancel-period-end',
      ]);
    case 'past_due':
      return new Set([
        'record-offline-payment',
        'cancel-immediately',
      ]);
    case 'cancelled':
      return new Set(['reactivate']);
    case 'expired':
      return new Set(['reactivate']);
    default:
      return new Set();
  }
}

export default function SubscriptionActions({
  subscription,
  onAction,
  isActionLoading,
  canManage,
}) {
  if (!subscription || !canManage) return null;

  const visibleKeys = getVisibleActionKeys(subscription.status);

  // Filter groups to only those that have at least one visible item
  const visibleGroups = ACTION_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => visibleKeys.has(item.key)),
    }))
    .filter((group) => group.items.length > 0);

  if (visibleGroups.length === 0) return null;

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Subscription actions">
      {visibleGroups.map((group, groupIndex) => (
        <div key={group.key} className={styles.groupWrapper}>
          {groupIndex > 0 && (
            <div className={styles.divider} aria-hidden="true" />
          )}
          <div className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            <div className={styles.buttons}>
              {group.items.map(({ key, label, Icon, danger, warning, tooltip }) => {
                const isLoading = isActionLoading === key;

                // Resolve button class
                let btnClass = styles.actionBtn;
                if (danger) {
                  btnClass = `${styles.actionBtnDangerSolid} ${isLoading ? styles.actionBtnDangerSolidLoading : ''}`;
                } else if (warning) {
                  btnClass = `${styles.actionBtn} ${styles.actionBtnWarning} ${isLoading ? styles.actionBtnLoading : ''}`;
                } else if (isLoading) {
                  btnClass = `${styles.actionBtn} ${styles.actionBtnLoading}`;
                }

                const btn = (
                  <button
                    key={key}
                    type="button"
                    className={btnClass}
                    onClick={() => onAction(key, subscription)}
                    disabled={isLoading}
                    aria-label={label}
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress
                        size={16}
                        className={styles.spinner}
                        aria-hidden="true"
                      />
                    ) : (
                      <Icon className={styles.icon} aria-hidden="true" />
                    )}
                    <span>{label}</span>
                  </button>
                );

                if (tooltip) {
                  return (
                    <Tooltip key={key} title={tooltip} arrow>
                      <span className={styles.btnWrapper}>{btn}</span>
                    </Tooltip>
                  );
                }

                return btn;
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
