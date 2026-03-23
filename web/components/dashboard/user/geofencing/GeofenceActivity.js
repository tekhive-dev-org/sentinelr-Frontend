/**
 * GeofenceActivity
 * Recent geofence activity timeline showing entry/exit events.
 */

import React from 'react';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import styles from './Geofencing.module.css';

function formatEventTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return isToday ? `Today ${time}` : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${time}`;
}

export default function GeofenceActivity({ events = [], onViewAll }) {
  if (events.length === 0) return null;

  return (
    <div className={styles.activitySection}>
      <div className={styles.activityHeader}>
        <span className={styles.activityTitle}>Recent Activity</span>
        <button className={styles.viewAllBtn} onClick={onViewAll}>
          View All
        </button>
      </div>
      <div className={styles.activityList}>
        {events.map((event) => {
          const isEntry = event.type === 'entry';
          return (
            <div key={event.id} className={styles.activityItem}>
              <div className={`${styles.activityDot} ${isEntry ? styles.dotEnter : styles.dotExit}`}>
                {isEntry ? <LoginIcon /> : <LogoutIcon />}
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>
                  {isEntry ? 'User Entered' : 'User Left'} {event.zoneName || 'Zone'}
                </div>
                <div className={styles.activityMeta}>
                  {formatEventTime(event.timestamp)}
                  {event.deviceName ? ` • ${event.deviceName}` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
