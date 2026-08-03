import { useEffect, useCallback, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { formatDateTime } from '../../utils/auditAdapters';
import styles from './AuditDetailDrawer.module.css';

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

function getActionCategoryClass(action) {
  if (!action) return 'actionOther';
  const prefix = action.split('.')[0];
  return ACTION_CATEGORY_MAP[prefix] || 'actionOther';
}

export default function AuditDetailDrawer({ entry, isOpen, onClose }) {
  const closeButtonRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      closeButtonRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const actionClass = entry ? getActionCategoryClass(entry.action) : '';
  const outcomeKey = entry?.outcome || 'success';
  const outcomeClass = OUTCOME_STYLE_MAP[outcomeKey] || 'outcomeSuccess';

  const hasBeforeAfter = entry?.before != null || entry?.after != null;

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Audit entry details"
    >
      <div
        className={`${styles.drawer} ${styles.drawerOpen}`}
        role="document"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close drawer"
        >
          <CloseIcon className={styles.closeIcon} />
        </button>

        {entry && (
          <>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerTop}>
                <span
                  className={`${styles.actionPill} ${styles[actionClass]}`}
                >
                  {entry.actionLabel || entry.action || 'Unknown'}
                </span>
                <span
                  className={`${styles.outcomePill} ${styles[outcomeClass]}`}
                >
                  {OUTCOME_LABEL_MAP[outcomeKey] || outcomeKey}
                </span>
              </div>
              <div className={styles.headerMeta}>
                <span className={styles.headerTimestamp}>
                  {formatDateTime(entry.timestamp)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {/* Actor */}
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Actor</p>
                <p className={styles.sectionValue}>{entry.actor || 'System'}</p>
                {entry.actorId && (
                  <p className={styles.sectionMono}>ID: {entry.actorId}</p>
                )}
              </div>

              {/* Resource */}
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Resource</p>
                <p className={styles.sectionValue}>
                  {entry.resource
                    ? entry.resource.charAt(0).toUpperCase() + entry.resource.slice(1)
                    : '—'}
                </p>
                {entry.resourceId && (
                  <p className={styles.sectionMono}>ID: {entry.resourceId}</p>
                )}
              </div>

              {/* Reason */}
              {entry.reason && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Reason</p>
                  <p className={styles.reasonText}>{entry.reason}</p>
                </div>
              )}

              {/* Change Summary — before/after */}
              {hasBeforeAfter && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Change Summary</p>
                  <div className={styles.changeGrid}>
                    <div className={styles.changeCol}>
                      <p className={styles.changeColLabel}>Before</p>
                      <pre className={styles.changeColContent}>
                        {entry.before != null
                          ? typeof entry.before === 'string'
                            ? entry.before
                            : JSON.stringify(entry.before, null, 2)
                          : '—'}
                      </pre>
                    </div>
                    <div className={styles.changeCol}>
                      <p className={styles.changeColLabel}>After</p>
                      <pre className={styles.changeColContent}>
                        {entry.after != null
                          ? typeof entry.after === 'string'
                            ? entry.after
                            : JSON.stringify(entry.after, null, 2)
                          : '—'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Technical Details</p>
                <div className={styles.techGrid}>
                  {entry.correlationId && (
                    <div className={styles.techRow}>
                      <span className={styles.techLabel}>Correlation ID</span>
                      <code className={styles.techValue}>{entry.correlationId}</code>
                    </div>
                  )}
                  {entry.ipAddress && (
                    <div className={styles.techRow}>
                      <span className={styles.techLabel}>IP Address</span>
                      <code className={styles.techValue}>{entry.ipAddress}</code>
                    </div>
                  )}
                  {entry.deviceInfo && (
                    <div className={styles.techRow}>
                      <span className={styles.techLabel}>Device</span>
                      <span className={styles.techValue}>{entry.deviceInfo}</span>
                    </div>
                  )}
                  {!entry.correlationId && !entry.ipAddress && !entry.deviceInfo && (
                    <p className={styles.sectionValue}>No technical details available</p>
                  )}
                </div>
              </div>

              {/* Deep Link */}
              {entry.resourceLink && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Quick Link</p>
                  <a
                    href={entry.resourceLink}
                    className={styles.deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenInNewIcon className={styles.deepLinkIcon} />
                    Open resource page
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <p className={styles.footerNote}>
                Audit records are immutable — created by backend only
              </p>
            </div>
          </>
        )}

        {!entry && (
          <div className={styles.body}>
            <p className={styles.sectionValue}>No entry data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
