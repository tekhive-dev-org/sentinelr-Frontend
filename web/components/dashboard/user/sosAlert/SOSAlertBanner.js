/**
 * SOSAlertBanner
 * Red critical SOS banner showing the active alert with device stats and action buttons.
 */

import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import ExploreIcon from '@mui/icons-material/Explore';
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import ShareIcon from '@mui/icons-material/Share';
import SpeedIcon from '@mui/icons-material/Speed';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import styles from './SOSAlert.module.css';

function formatDateTime(dateValue) {
  if (!dateValue) return 'Awaiting sync';

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Awaiting sync';

  return parsedDate.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

export default function SOSAlertBanner({
  alert,
  pendingAction,
  onCall,
  onCopySummary,
  onOpenMap,
  onResolve,
  onDismiss,
}) {
  if (!alert) return null;

  const isResolving = pendingAction === `resolve:${alert.id}`;
  const isDismissing = pendingAction === `dismiss:${alert.id}`;

  return (
    <div className={styles.criticalBanner}>
      <div className={styles.bannerTop}>
        <div>
          <span className={styles.bannerLabel}>Critical SOS</span>
            <span className={styles.bannerSubLabel}>Live response required</span>
        </div>

        <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            {alert.statusLabel}
        </span>
      </div>

      <div className={styles.bannerIdentity}>
          <div className={styles.bannerAvatar}>
            {alert.userName.slice(0, 2).toUpperCase()}
          </div>

          <div className={styles.bannerAvatarText}>
            <h2 className={styles.bannerName}>{alert.userName}</h2>
            <p className={styles.bannerIncidentMeta}>{alert.incidentCode} · {alert.triggerLabel}</p>
            <div className={styles.bannerPills}>
              <span className={styles.bannerPill}>{alert.priorityLabel}</span>
              <span className={styles.bannerPill}>{alert.deviceName}</span>
            </div>
          </div>
        </div>

      <div className={styles.incidentSummaryGrid}>
          <div className={styles.incidentSummaryCard}>
            <span className={styles.incidentSummaryLabel}>Primary contact</span>
            <strong className={styles.incidentSummaryValue}>{alert.phone}</strong>
            <span className={styles.incidentSummaryMeta}>{alert.relationship}</span>
          </div>
          <div className={styles.incidentSummaryCard}>
            <span className={styles.incidentSummaryLabel}>Last known location</span>
            <strong className={styles.incidentSummaryValue}>{alert.locationLabel}</strong>
            <span className={styles.incidentSummaryMeta}>{alert.coordinatesLabel}</span>
          </div>
      </div>

      <div className={styles.bannerDivider} />

      <div className={styles.deviceStatsGrid}>
        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <AccessTimeIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Triggered</span>
            <span className={styles.deviceStatValue}>{formatDateTime(alert.createdAt)}</span>
            <span className={`${styles.deviceStatSublabel} ${styles.alertValue}`}>{alert.relativeTime}</span>
          </div>
        </div>

        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <BatteryAlertIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Battery</span>
            <span className={styles.deviceStatValue}>{alert.batteryLabel}</span>
            <span className={styles.deviceStatSublabel}>{alert.deviceStatus}</span>
          </div>
        </div>

        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <SpeedIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Movement</span>
            <span className={styles.deviceStatValue}>{alert.speedLabel}</span>
            <span className={styles.deviceStatSublabel}>{alert.movementType}</span>
          </div>
        </div>

        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <ExploreIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Heading</span>
            <span className={styles.deviceStatValue}>{alert.headingLabel}</span>
            <span className={styles.deviceStatSublabel}>Response clock: {alert.responseClock}</span>
          </div>
        </div>

        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <SmartphoneOutlinedIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Protected device</span>
            <span className={styles.deviceStatValue}>{alert.deviceName}</span>
            <span className={styles.deviceStatSublabel}>{alert.deviceType}</span>
          </div>
        </div>

        <div className={styles.deviceStatCard}>
          <div className={styles.deviceStatIcon}>
            <MyLocationOutlinedIcon />
          </div>
          <div className={styles.deviceStatInfo}>
            <span className={styles.deviceStatLabel}>Resolution note</span>
            <span className={styles.deviceStatValue}>{alert.resolution}</span>
            <span className={styles.deviceStatSublabel}>{alert.description}</span>
          </div>
        </div>
      </div>

      <div className={styles.bannerDivider} />

      <div className={styles.actionButtons}>
        <div className={styles.primaryActionRow}>
          <button type="button" className={styles.callBtn} onClick={() => onCall(alert)}>
            <PhoneIcon className={styles.actionIcon} />
            Call contact
          </button>

          <button type="button" className={styles.mapBtn} onClick={() => onOpenMap(alert)}>
            <MyLocationOutlinedIcon className={styles.actionIcon} />
            Open map
          </button>
        </div>

        <button type="button" className={styles.shareBtn} onClick={() => onCopySummary(alert)}>
          <ShareIcon className={styles.actionIcon} />
          Copy incident brief
        </button>

        <div className={styles.resolveActions}>
          <button
            type="button"
            className={styles.resolveBtn}
            onClick={() => onResolve(alert)}
            disabled={isResolving || isDismissing}
          >
            {isResolving ? 'Resolving…' : 'Mark resolved'}
          </button>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => onDismiss(alert)}
            disabled={isResolving || isDismissing}
          >
            {isDismissing ? 'Dismissing…' : 'Dismiss alert'}
          </button>
        </div>
      </div>
    </div>
  );
}
