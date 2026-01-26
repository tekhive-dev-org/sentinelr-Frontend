import React from 'react';
import styles from './DevicesAndUsers.module.css';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function DevicesList({ devices = [], onAddDevice }) {
  if (devices.length === 0) {
    return (
      <div className={styles.emptyState}>
        {/* Empty State Illustration */}
        <svg className={styles.emptyIllustration} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Clock/Timer illustration */}
          <circle cx="60" cy="60" r="45" stroke="#E5E7EB" strokeWidth="2" fill="#F9FAFB"/>
          <circle cx="60" cy="60" r="38" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 4" fill="none"/>
          
          {/* Clock hands */}
          <line x1="60" y1="60" x2="60" y2="35" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="60" y1="60" x2="78" y2="60" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Center dot */}
          <circle cx="60" cy="60" r="4" fill="#6B7280"/>
          
          {/* Bell/Alarm top */}
          <ellipse cx="60" cy="18" rx="8" ry="4" fill="#D1D5DB"/>
          <rect x="58" y="14" width="4" height="8" fill="#D1D5DB"/>
          
          {/* Sparkles */}
          <path d="M95 25L97 30L102 32L97 34L95 39L93 34L88 32L93 30L95 25Z" fill="#D1D5DB"/>
          <path d="M25 35L26.5 38.5L30 40L26.5 41.5L25 45L23.5 41.5L20 40L23.5 38.5L25 35Z" fill="#E5E7EB"/>
          <path d="M100 70L101 73L104 74L101 75L100 78L99 75L96 74L99 73L100 70Z" fill="#E5E7EB"/>
        </svg>

        <h3 className={styles.emptyTitle}>No Devices Added Yet</h3>
        <p className={styles.emptyDescription}>
          To add new devices to track, please, click the add button.
        </p>
        
        <button className={styles.addButton} onClick={onAddDevice}>
          <AddIcon className={styles.addButtonIcon} />
          Pair Device
          <ChevronRightIcon className={styles.addButtonIcon} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.devicesTableContainer}>
      {/* Devices Table */}
      <table className={styles.devicesTable}>
        <thead>
          <tr>
            <th>Device Name</th>
            <th>Device Type</th>
            <th>Battery Percentage</th>
            <th>Last Seen</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td className={styles.deviceNameCell}>{device.name}</td>
              <td>{device.type === 'phone' ? 'IOS' : device.type === 'android' ? 'Android' : device.deviceType || 'IOS'}</td>
              <td>{device.battery || Math.floor(Math.random() * 50 + 40)}%</td>
              <td>{device.lastSeen || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}</td>
              <td>
                <span className={`${styles.statusBadge} ${device.status === 'online' ? styles.statusOnlineBadge : styles.statusOfflineBadge}`}>
                  <span className={styles.statusDotSmall}></span>
                  {device.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </td>
              <td>
                <button className={styles.tableActionBtn}>
                  <MoreVertIcon style={{ fontSize: 18 }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

