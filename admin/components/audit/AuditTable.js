import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { formatDateTime } from '../../utils/auditAdapters';
import styles from './AuditTable.module.css';

const ACTION_CATEGORY_MAP = {
  user: 'actionUser',
  device: 'actionDevice',
  alert: 'actionAlert',
  subscription: 'actionSubscription',
  content: 'actionContent',
  role: 'actionRole',
  admin: 'actionAdmin',
};

const OUTCOME_STYLE_MAP = {
  success: 'outcomeSuccess',
  failure: 'outcomeFailed',
  denied: 'outcomeDenied',
};

const OUTCOME_LABEL_MAP = {
  success: 'Success',
  failure: 'Failed',
  denied: 'Denied',
};

const COLUMNS = [
  'Timestamp',
  'Actor',
  'Action',
  'Resource',
  'Outcome',
  'Summary',
  'Details',
];

function getActionCategoryClass(action) {
  if (!action) return 'actionOther';
  const prefix = action.split('.')[0];
  return ACTION_CATEGORY_MAP[prefix] || 'actionOther';
}

function SkeletonRow() {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <div className={styles.skeleton} style={{ width: 140, height: 14 }} />
      </td>
      <td className={styles.cell}>
        <div className={styles.skeleton} style={{ width: 90, height: 14 }} />
      </td>
      <td className={styles.cell}>
        <div className={styles.skeleton} style={{ width: 80, height: 22, borderRadius: 999 }} />
      </td>
      <td className={styles.cell}>
        <div className={styles.skeleton} style={{ width: 70, height: 14 }} />
      </td>
      <td className={styles.cell}>
        <div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} />
      </td>
      <td className={styles.cell}>
        <div className={styles.skeleton} style={{ width: 180, height: 14 }} />
      </td>
      <td className={styles.cell}>
        <div className={styles.skeleton} style={{ width: 28, height: 28 }} />
      </td>
    </tr>
  );
}

export default function AuditTable({ entries, isLoading, error, onEntryClick }) {
  const handleRowClick = useCallback(
    (entry) => {
      if (onEntryClick) onEntryClick(entry);
    },
    [onEntryClick],
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

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              {COLUMNS.map((col) => (
                <th key={col} className={styles.headerCell}>
                  {col === 'Details' ? (
                    <span className={styles.srOnly}>Details</span>
                  ) : (
                    col
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <SkeletonRow key={`skel-${i}`} />
              ))}

            {!isLoading && !error && entries.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <SearchOffIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>No audit entries match your filters</p>
                    <p className={styles.emptyDesc}>
                      Try adjusting your search criteria or clearing the filters above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              entries.map((entry) => {
                const actionClass = getActionCategoryClass(entry.action);
                const outcomeKey = entry.outcome || 'success';
                const outcomeClass = OUTCOME_STYLE_MAP[outcomeKey] || 'outcomeSuccess';

                return (
                  <tr
                    key={entry.id}
                    className={styles.row}
                    onClick={() => handleRowClick(entry)}
                    role="row"
                  >
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>
                        {entry.actor || '—'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.actionPill} ${styles[actionClass]}`}
                      >
                        {entry.actionLabel || entry.action || '—'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>
                        {entry.resource || '—'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.outcomePill} ${styles[outcomeClass]}`}
                      >
                        {OUTCOME_LABEL_MAP[outcomeKey] || outcomeKey}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>
                        {entry.summary || '—'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <button
                        type="button"
                        className={styles.detailsBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(entry);
                        }}
                        aria-label={`View details for ${entry.actionLabel || entry.action}`}
                      >
                        <ArrowForwardIosIcon className={styles.detailsIcon} />
                      </button>
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
