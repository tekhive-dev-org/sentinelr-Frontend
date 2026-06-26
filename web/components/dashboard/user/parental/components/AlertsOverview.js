import React from 'react';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import styles from '../ParentalControl.module.css';

const ACTIVITY_CONFIG = {
  app_install: { icon: <GetAppRoundedIcon />, className: 'activityIconYellow' },
  web_blocked: { icon: <BlockRoundedIcon />, className: 'activityIconRed' },
  screen_time_limit: { icon: <TimerRoundedIcon />, className: 'activityIconPurple' },
  geofence: { icon: <PlaceRoundedIcon />, className: 'activityIconOrange' },
  app_blocked: { icon: <LockRoundedIcon />, className: 'activityIconRed' },
};
const DEFAULT_ACTIVITY = { icon: <AssignmentRoundedIcon />, className: 'activityIconNeutral' };

function timeAgo(timestamp) {
  const parsed = new Date(timestamp).getTime();
  if (!timestamp || Number.isNaN(parsed)) return 'Recently';

  const diff = Date.now() - parsed;
  if (diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function renderActivityText(act) {
  switch (act.type) {
    case 'app_install':
      return (
        <>
          {act.description?.split(act.app || '').map((part, i, arr) =>
            i < arr.length - 1 ? (
              <React.Fragment key={i}>
                {part}<strong>{act.app}</strong>
              </React.Fragment>
            ) : part
          )}
        </>
      );
    case 'web_blocked':
      return (
        <>
          Attempted to visit <span className={styles.activityHighlightDanger}>{act.url}</span>
          {act.status ? ` (${act.status})` : ''}
        </>
      );
    case 'screen_time_limit':
      return (
        <>
          Screen time limit reached for{' '}
          <span className={styles.activityHighlight}>{act.app}</span>
        </>
      );
    default:
      return act.description || 'Unknown activity';
  }
}

export default function AlertsOverview({
  activities = [],
  activityLimit = 10,
  setActivityLimit = () => {},
  loading = false,
}) {
  return (
    <div className={styles.activitySection}>
      <div className={styles.activityHeader}>
        <h3 className={styles.sectionTitle}>Recent Device Activity & Alerts</h3>
        <div className={styles.limitFilterWrapper}>
          <label htmlFor="activityLimit" className={styles.limitLabel}>Show:</label>
          <select
            id="activityLimit"
            className={styles.limitSelect}
            value={activityLimit}
            onChange={(e) => setActivityLimit(Number(e.target.value))}
          >
            <option value={5}>5 items</option>
            <option value={10}>10 items</option>
            <option value={20}>20 items</option>
            <option value={50}>50 items</option>
            <option value={100}>100 items</option>
          </select>
        </div>
      </div>
      
      <div className={`${styles.activityCard} ${loading ? styles.loadingOpacity : ''}`}>
        <div className={styles.activityList}>
          {activities.length === 0 ? (
            <span className={styles.activityEmptyText}>
              No recent notifications or security activity logs found.
            </span>
          ) : (
            activities.map((act) => {
              const cfg = ACTIVITY_CONFIG[act.type] || DEFAULT_ACTIVITY;
              const activityTime = act.timestamp || act.createdAt || act.updatedAt || act.time;
              return (
                <div key={act.id} className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${styles[cfg.className]}`}>
                    {cfg.icon}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      {renderActivityText(act)}
                    </div>
                    <div className={styles.activityTime}>{timeAgo(activityTime)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
