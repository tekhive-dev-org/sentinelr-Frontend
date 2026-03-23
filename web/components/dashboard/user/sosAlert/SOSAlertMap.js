/**
 * SOSAlertMap
 * Displays the map section for the active SOS alert location.
 * Uses dynamic import for the Google Maps component (no SSR).
 */

import React from 'react';
import dynamic from 'next/dynamic';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import styles from './SOSAlert.module.css';

const LiveLocationMap = dynamic(
  () => import('../LiveLocationMap'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: '420px',
          background: '#eef2f6',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: '13px',
        }}
      >
        Loading map…
      </div>
    ),
  }
);

export default function SOSAlertMap({ alert }) {
  const address = alert?.location?.address || 'Unknown location';

  return (
    <div className={styles.mapSection}>
      <div className={styles.mapOverlay}>
        <LocationOnIcon />
        {address}
      </div>
      <button className={styles.mapDetailsLink}>
        Details &gt;
      </button>
      <div className={styles.mapWrapper}>
        <LiveLocationMap />
      </div>
    </div>
  );
}
