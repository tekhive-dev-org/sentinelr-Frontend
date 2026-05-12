import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import styles from './SOSAlert.module.css';

function formatDateTime(dateValue) {
  if (!dateValue) return 'Awaiting sync';

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Awaiting sync';

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStatusClass(status) {
  if (status === 'resolved') return styles.statusResolved;
  if (status === 'dismissed') return styles.statusDismissed;
  return styles.statusActive;
}

export default function SOSAlertIncidentModal({
  alert,
  isOpen,
  pendingAction,
  onClose,
  onCall,
  onCopySummary,
  onOpenMap,
  onResolve,
  onDismiss,
}) {
  if (!isOpen || !alert) return null;

  const isResolving = pendingAction === `resolve:${alert.id}`;
  const isDismissing = pendingAction === `dismiss:${alert.id}`;
  const canUpdateIncident = alert.status === 'active' || alert.status === 'unresolved';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.incidentModal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalEyebrow}>Incident details</span>
            <h2 className={styles.modalTitle}>{alert.incidentCode} · {alert.userName}</h2>
          </div>

          <button type="button" className={styles.modalCloseBtn} onClick={onClose} aria-label="Close incident details">
            <CloseIcon style={{ fontSize: 18 }} />
          </button>
        </div>

        <div className={styles.modalStatusRow}>
          <span className={`${styles.statusBadge} ${getStatusClass(alert.status)}`}>
            <span className={styles.statusDot} />
            {alert.statusLabel}
          </span>
          <span className={styles.bannerPill}>{alert.priorityLabel}</span>
          <span className={styles.bannerPill}>{alert.triggerLabel}</span>
        </div>

        <div className={styles.modalSectionGrid}>
          <section className={styles.modalSection}>
            <div className={styles.detailSectionTitle}>
              <PersonOutlineOutlinedIcon style={{ fontSize: 18 }} />
              Member context
            </div>
            <div className={styles.detailList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailValue}>{alert.userName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Relationship</span>
                <span className={styles.detailValue}>{alert.relationship}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Primary contact</span>
                <span className={styles.detailValue}>{alert.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{alert.email}</span>
              </div>
            </div>
          </section>

          <section className={styles.modalSection}>
            <div className={styles.detailSectionTitle}>
              <SmartphoneOutlinedIcon style={{ fontSize: 18 }} />
              Device telemetry
            </div>
            <div className={styles.detailList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Protected device</span>
                <span className={styles.detailValue}>{alert.deviceName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Device type</span>
                <span className={styles.detailValue}>{alert.deviceType}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Battery</span>
                <span className={styles.detailValue}>{alert.batteryLabel}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Speed / heading</span>
                <span className={styles.detailValue}>{alert.speedLabel} · {alert.headingLabel}</span>
              </div>
            </div>
          </section>

          <section className={styles.modalSection}>
            <div className={styles.detailSectionTitle}>
              <LocationOnOutlinedIcon style={{ fontSize: 18 }} />
              Location evidence
            </div>
            <div className={styles.detailList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Last known address</span>
                <span className={styles.detailValue}>{alert.locationLabel}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Coordinates</span>
                <span className={styles.detailValue}>{alert.coordinatesLabel}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Device status</span>
                <span className={styles.detailValue}>{alert.deviceStatus}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Last device update</span>
                <span className={styles.detailValue}>{formatDateTime(alert.lastUpdatedAt)}</span>
              </div>
            </div>
          </section>

          <section className={styles.modalSection}>
            <div className={styles.detailSectionTitle}>
              <AccessTimeIcon style={{ fontSize: 18 }} />
              Incident timeline
            </div>
            <div className={styles.detailList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Triggered</span>
                <span className={styles.detailValue}>{formatDateTime(alert.createdAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Response clock</span>
                <span className={styles.detailValue}>{alert.responseClock}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Current resolution</span>
                <span className={styles.detailValue}>{alert.resolution}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Operator note</span>
                <span className={styles.detailValue}>{alert.description}</span>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.modalPrimaryAction} onClick={() => onCall(alert)}>
            Call contact
          </button>
          <button type="button" className={styles.modalSecondaryAction} onClick={() => onOpenMap(alert)}>
            Open map
          </button>
          <button type="button" className={styles.modalSecondaryAction} onClick={() => onCopySummary(alert)}>
            Copy brief
          </button>
          {canUpdateIncident && (
            <button
              type="button"
              className={styles.modalPrimaryAction}
              onClick={() => onResolve(alert)}
              disabled={isResolving || isDismissing}
            >
              {isResolving ? 'Resolving…' : 'Mark resolved'}
            </button>
          )}
          {canUpdateIncident && (
            <button
              type="button"
              className={styles.modalDangerAction}
              onClick={() => onDismiss(alert)}
              disabled={isResolving || isDismissing}
            >
              {isDismissing ? 'Dismissing…' : 'Dismiss alert'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}