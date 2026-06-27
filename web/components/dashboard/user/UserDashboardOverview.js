import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DevicesIcon from '@mui/icons-material/Devices';
import SosIcon from '@mui/icons-material/Sos';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardStatCard from '../common/DashboardStatCard';
import styles from './UserDashboardOverview.module.css';
import MapSkeleton from '../../ui/loaders/MapSkeleton';
import useUserDashboardStats from './useUserDashboardStats';

// Google Maps requires the DOM — disable SSR for this component
const LiveLocationMap = dynamic(
  () => import('./LiveLocationMap'),
  {
    ssr: false,
    loading: () => <MapSkeleton height="200px" />,
  }
);

const ALERT_TYPE_LABELS = {
  sos: 'Manual SOS',
  intruder: 'Intruder alert',
  geofence: 'Geofence alert',
  screen_time: 'Screen time alert',
  impact: 'Impact detected',
};

const titleCase = (value) => String(value || 'Alert')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getAlertDate = (alert) => alert?.createdAt || alert?.timestamp || alert?.updatedAt || alert?.date;

const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return 'Recently';

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions = [
    { amount: 60, name: 'second' },
    { amount: 60, name: 'minute' },
    { amount: 24, name: 'hour' },
    { amount: 7, name: 'day' },
    { amount: 4.34524, name: 'week' },
    { amount: 12, name: 'month' },
    { amount: Number.POSITIVE_INFINITY, name: 'year' },
  ];

  let duration = diffSeconds;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return 'Recently';
};

const getAlertTitle = (alert) => {
  if (alert?.title) return alert.title;
  if (alert?.message) return alert.message;
  const type = String(alert?.type || '').toLowerCase();
  return ALERT_TYPE_LABELS[type] || titleCase(type || alert?.category || 'Alert event');
};

const getAlertMeta = (alert) => {
  if (alert?.description) {
    return String(alert.description).split('\n')[0];
  }

  if (alert?.userName) {
    return `Triggered by ${alert.userName}`;
  }

  const deviceName = alert?.device?.deviceName || alert?.device?.name || alert?.deviceName || alert?.deviceId;
  const childName = alert?.child?.name || alert?.user?.name || alert?.assignedUser?.name;
  const coordinates = alert?.location?.latitude && alert?.location?.longitude
    ? `${Number(alert.location.latitude).toFixed(4)}, ${Number(alert.location.longitude).toFixed(4)}`
    : '';
  const location = alert?.location?.address || alert?.address || coordinates;
  return childName || deviceName || location || 'Sentinelr activity';
};

const getAlertContext = (alert) => {
  const context = [];

  if (alert?.userName) context.push(alert.userName);
  if (alert?.deviceId) context.push(`Device #${alert.deviceId}`);
  if (alert?.priority) context.push(`${titleCase(alert.priority)} priority`);

  return context.join(' · ');
};

const getAlertTone = (alert) => {
  const status = String(alert?.status || '').toLowerCase();
  const type = String(alert?.type || '').toLowerCase();
  if (status === 'resolved' || status === 'dismissed') return 'resolved';
  if (type === 'sos' || status === 'active' || status === 'unresolved') return 'critical';
  if (type === 'geofence' || type === 'screen_time') return 'attention';
  return 'neutral';
};

export default function UserDashboardOverview() {
  const router = useRouter();
  const [showMapDetails, setShowMapDetails] = useState(true);
  const { stats, loading, errors, refresh } = useUserDashboardStats();
  // console.log('UserDashboardOverview stats:', stats, 'loading:', loading, 'errors:', errors);

  const statActions = {
    devices: [
      { label: 'View details', kind: 'navigate', icon: ArrowForwardIcon, onSelect: () => router.push('/dashboard/devices') },
      { label: 'Refresh', kind: 'refresh', icon: RefreshIcon, onSelect: refresh },
    ],
    alerts: [
      { label: 'View alerts', kind: 'navigate', icon: ArrowForwardIcon, onSelect: () => router.push('/dashboard/alerts') },
      { label: 'Refresh', kind: 'refresh', icon: RefreshIcon, onSelect: refresh },
    ],
  };

  return (
    <div className={styles.container}>
      {/* Live Location Map */}
      <div className={styles.mapSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Live Location</h2>
          <button className={styles.detailsLink} onClick={() => setShowMapDetails(!showMapDetails)}>
            {showMapDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        <div className={styles.mapPlaceholder}>
          <LiveLocationMap showDetails={showMapDetails} />
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <DashboardStatCard
          title="Active Devices"
          value={stats.activeDevices.length}
          meta={`${stats.pairedDevices.length} paired device${stats.pairedDevices.length === 1 ? '' : 's'} tracked`}
          Icon={DevicesIcon}
          tone="purple"
          status={stats.activeDevices.length > 0 ? 'Online' : 'Quiet'}
          statusTone={stats.activeDevices.length > 0 ? 'positive' : 'neutral'}
          loading={loading}
          error={errors.devices}
          emptyText="No active devices online"
          actions={statActions.devices}
        />

        <DashboardStatCard
          title="Alerts Today"
          value={stats.alertsToday.length}
          meta="Live alert events received today"
          Icon={WarningAmberIcon}
          tone="orange"
          status={stats.alertsToday.length > 0 ? 'Needs review' : 'Clear'}
          statusTone={stats.alertsToday.length > 0 ? 'attention' : 'positive'}
          loading={loading}
          error={errors.alerts}
          emptyText="No alerts received today"
          actions={statActions.alerts}
        />

        <DashboardStatCard
          title="SOS Active"
          value={stats.activeSos.length}
          meta="Unresolved SOS incidents"
          Icon={SosIcon}
          tone="red"
          status={stats.activeSos.length > 0 ? 'Critical' : 'Clear'}
          statusTone={stats.activeSos.length > 0 ? 'danger' : 'positive'}
          loading={loading}
          error={errors.sos}
          emptyText="No active SOS incidents"
          actions={statActions.alerts}
        />
      </div>

      <div className={styles.mainContentGrid}>
        <div className={styles.leftColumn}>
          {/* Charts Row */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.sectionTitle}>Usage Insight</h3>
              <div className={styles.comingSoonPanel}>
                <div className={styles.comingSoonWrapper}>
                  <span className={styles.comingSoonBadge}>Coming Soon</span>
                  <p className={styles.comingSoonLabel}>Usage analytics will appear here</p>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.sectionTitle}>Subscription</h3>
              <div className={styles.comingSoonPanel}>
                <div className={styles.comingSoonWrapper}>
                  <span className={styles.comingSoonBadge}>Coming Soon</span>
                  <p className={styles.comingSoonLabel}>Subscription trends will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Screen Time */}
          <div className={styles.screenTimeCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Screen Time</h3>
            </div>
            <div className={styles.comingSoonWrapper}>
              <span className={styles.comingSoonBadge}>Coming Soon</span>
              <p className={styles.comingSoonLabel}>Per-app screen time tracking is on its way</p>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Recent Activity */}
          <div className={styles.activityCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}> Activities</h3>
              <div className={styles.activityActions}>
                <button
                  type="button"
                  className={styles.activityIconButton}
                  onClick={refresh}
                  disabled={loading}
                  aria-label="Refresh alert feed"
                  title="Refresh"
                >
                  <RefreshIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  className={styles.viewAllButton}
                  onClick={() => router.push('/dashboard/alerts')}
                >
                  View all
                  <ArrowForwardIcon fontSize="small" />
                </button>
              </div>
            </div>
            {loading ? (
              <div className={styles.activityList} aria-label="Loading recent alert feed">
                {[0, 1, 2].map((item) => (
                  <div key={item} className={`${styles.activityItem} ${styles.activitySkeleton}`}>
                    <span className={styles.activityPulseIcon} />
                    <div className={styles.activitySkeletonContent}>
                      <span />
                      <span />
                    </div>
                  </div>
                ))}
              </div>
            ) : errors.alerts ? (
              <div className={styles.activityState}>
                <span className={styles.activityStateBadge}>Feed unavailable</span>
                <p>{errors.alerts}</p>
                <button type="button" className={styles.activityRetryButton} onClick={refresh}>
                  Try again
                </button>
              </div>
            ) : stats.recentAlerts.length === 0 ? (
              <div className={styles.activityState}>
                <span className={styles.activityStateBadge}>All clear</span>
                <p>No recent alerts or activity events found.</p>
              </div>
            ) : (
              <div className={styles.activityList}>
                {stats.recentAlerts.map((alert, index) => {
                  const tone = getAlertTone(alert);
                  const key = alert.id || alert._id || `${getAlertDate(alert)}-${index}`;
                  return (
                    <button
                      type="button"
                      key={key}
                      className={styles.activityItem}
                      onClick={() => router.push('/dashboard/alerts')}
                    >
                      <span className={`${styles.activityDot} ${styles[`activityDot_${tone}`]}`} />
                      <span className={styles.activityContent}>
                        <span className={styles.activityHeader}>
                          <span className={styles.activityTitle}>{getAlertTitle(alert)}</span>
                          <span className={styles.activityTime}>{formatRelativeTime(getAlertDate(alert))}</span>
                        </span>
                        {getAlertContext(alert) && (
                          <span className={styles.activityContext}>{getAlertContext(alert)}</span>
                        )}
                        <span className={styles.activityStatus}>
                          <span>{getAlertMeta(alert)}</span>
                          <span className={`${styles.statusBadge} ${styles[`statusBadge_${tone}`]}`}>
                            {titleCase(alert.status || alert.type || 'New')}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
