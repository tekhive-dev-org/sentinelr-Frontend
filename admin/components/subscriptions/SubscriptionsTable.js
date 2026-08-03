import { useCallback } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import styles from './SubscriptionsTable.module.css';

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

const SORTABLE_COLUMNS = [
  { key: 'plan', label: 'Plan' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'renewal', label: 'Renewal' },
];

function maskProviderRef(ref) {
  if (!ref) return '—';
  if (ref.length <= 8) return ref;
  return ref.slice(0, 4) + '••••' + ref.slice(-4);
}

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

function SkeletonRow() {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <div className={styles.subscriberCell}>
          <div className={styles.skeleton} style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div>
            <div className={styles.skeleton} style={{ width: 100, height: 14, marginBottom: 4 }} />
          </div>
        </div>
      </td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 130, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 70, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 60, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 56, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 72, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 80, height: 14 }} /></td>
    </tr>
  );
}

export default function SubscriptionsTable({
  subscriptions,
  isLoading,
  error,
  onSort,
  sortBy,
  sortOrder,
  onSubscriptionClick,
}) {
  const handleSort = useCallback(
    (key) => {
      onSort(key);
    },
    [onSort],
  );

  const handleRowClick = useCallback(
    (subscription) => {
      onSubscriptionClick(subscription);
    },
    [onSubscriptionClick],
  );

  const isSortable = (key) => SORTABLE_COLUMNS.some((col) => col.key === key);

  const renderHeaderCell = (key, label) => {
    if (!isSortable(key)) {
      return (
        <th key={key} className={styles.headerCellNonSortable}>
          {label}
        </th>
      );
    }

    return (
      <th
        key={key}
        className={styles.headerCell}
        onClick={() => handleSort(key)}
        role="columnheader"
        aria-sort={
          sortBy === key
            ? sortOrder === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
        }
      >
        <span className={styles.headerContent}>
          {label}
          {sortBy === key && (
            <span className={styles.sortIcon}>
              {sortOrder === 'asc' ? (
                <ArrowUpwardIcon className={styles.sortArrow} />
              ) : (
                <ArrowDownwardIcon className={styles.sortArrow} />
              )}
            </span>
          )}
        </span>
      </th>
    );
  };

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

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              {renderHeaderCell('subscriber', 'Subscriber')}
              <th className={styles.headerCellNonSortable}>Email</th>
              {renderHeaderCell('plan', 'Plan')}
              {renderHeaderCell('status', 'Status')}
              {renderHeaderCell('amount', 'Amount')}
              <th className={styles.headerCellNonSortable}>Billing Period</th>
              {renderHeaderCell('renewal', 'Renewal')}
              <th className={styles.headerCellNonSortable}>Provider</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />)}

            {!isLoading && !error && subscriptions.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <SearchOffIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>No subscriptions match your filters</p>
                    <p className={styles.emptyDesc}>
                      Try adjusting your search criteria or clearing the filters above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              subscriptions.map((subscription) => {
                const st = statusKey(subscription.status);
                const isPastDue = st === 'pastdue';
                const planLabel = PLAN_LABELS[subscription.plan?.toLowerCase()] || subscription.plan || '—';
                const billingLabel =
                  subscription.billingPeriod === 'annual'
                    ? 'Annual'
                    : subscription.billingPeriod === 'monthly'
                      ? 'Monthly'
                      : subscription.billingPeriod || '—';

                return (
                  <tr
                    key={subscription.id}
                    className={isPastDue ? styles.rowPastDue : styles.row}
                    onClick={() => handleRowClick(subscription)}
                    role="row"
                  >
                    <td className={styles.cell}>
                      <div className={styles.subscriberCell}>
                        <div className={styles.subscriberIcon}>
                          <PersonOutlinedIcon className={styles.subscriberIconSvg} />
                        </div>
                        <span className={styles.subscriberName}>
                          {subscription.subscriber || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>
                        {subscription.email || '—'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{planLabel}</span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${st.charAt(0).toUpperCase() + st.slice(1)}`]
                        }`}
                      >
                        {STATUS_LABELS[st] || subscription.status}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{billingLabel}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>
                        {formatRenewal(subscription.renewal)}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>
                        {maskProviderRef(subscription.providerRef)}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
