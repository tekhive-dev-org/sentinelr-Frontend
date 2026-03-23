/**
 * SOSAlertHistory
 * Recent alert history table with search, status badges, and row actions.
 */

import React, { useState, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from './SOSAlert.module.css';

const STATUS_CLASSES = {
  resolved: styles.statusResolved,
  dismissed: styles.statusDismissed,
  cancelled: styles.statusDismissed,
  active: styles.statusActive,
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit' }) +
    ', ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function SOSAlertHistory({ alerts = [], loading }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return alerts;
    const q = search.toLowerCase();
    return alerts.filter(
      (a) =>
        (a.userName || '').toLowerCase().includes(q) ||
        (a.location?.address || '').toLowerCase().includes(q) ||
        (a.type || '').toLowerCase().includes(q) ||
        (a.title || '').toLowerCase().includes(q)
    );
  }, [alerts, search]);

  return (
    <div className={styles.historySection}>
      <div className={styles.historyHeader}>
        <h2 className={styles.historyTitle}>Recent Alert History</h2>
        <div className={styles.searchWrapper}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for a nam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <span style={{ color: '#9ca3af', fontSize: 14 }}>Loading alerts…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {search ? 'No alerts match your search.' : 'No alert history yet.'}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date &amp; Time</th>
                <th>Location</th>
                <th>Trigger</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => {
                const statusClass = STATUS_CLASSES[alert.status] || STATUS_CLASSES.active;
                const triggerLabel =
                  alert.type === 'sos'
                    ? 'Manual SOS'
                    : alert.type === 'intruder'
                    ? 'Intruder Alert'
                    : alert.type === 'geofence'
                    ? 'Geofence Breach'
                    : alert.type === 'impact'
                    ? 'Impact Detected'
                    : capitalise(alert.type || 'Alert');

                return (
                  <tr key={alert.id}>
                    <td>{alert.userName || '--'}</td>
                    <td>{formatDate(alert.createdAt)}</td>
                    <td>{alert.location?.address || '--'}</td>
                    <td>{triggerLabel}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass}`}>
                        <span className={styles.statusDot} />
                        {capitalise(alert.status)}
                      </span>
                    </td>
                    <td>
                      <button className={styles.rowMenuBtn} aria-label="More options">
                        <MoreVertIcon style={{ fontSize: 18 }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
