/**
 * HistoryTimeline
 * Right-hand timeline sidebar showing chronological driving, stop, and alert events.
 */

import React from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { format } from 'date-fns';
import styles from './HistoryReports.module.css';

/**
 * Expected event shape:
 * {
 *   id: string | number,
 *   type: 'start' | 'driving' | 'stop' | 'alert',
 *   label?: string,            // e.g. "Home Base"
 *   time?: string,             // "08:00 AM"
 *   timeRange?: string,        // "07:00 - 07:30"
 *   date?: string | Date,
 *   distance?: string,         // "5.2 miles"
 *   speed?: string,            // "Avg Speed: 35mph"
 *   location?: string,         // "Ikeja - City Mall"
 *   address?: string,          // "123 Ikeja drive, Lagos"
 *   duration?: string,         // "STOP 1H 15M"
 *   alertTitle?: string,       // "GEOFENCE EXIT"
 *   alertMessage?: string,
 * }
 */

function formatDate(d) {
  if (!d) return '';
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return format(dt, 'MMM d, yyyy');
  } catch {
    return String(d);
  }
}

function TimelineStartItem({ event }) {
  return (
    <div className={styles.timelineItem}>
      <div className={`${styles.timelineNode} ${styles.nodeGray}`} />
      <div className={styles.timelineStartMarker}>
        Start of day
      </div>
      <div className={styles.timelineStartLocation}>
        {event.time && <>{event.time} • </>}
        {event.label || 'Unknown'}
      </div>
    </div>
  );
}

function TimelineDrivingItem({ event }) {
  return (
    <div className={styles.timelineItem}>
      <div className={`${styles.timelineNode} ${styles.nodeBlue}`}>
        <DirectionsCarIcon />
      </div>
      <div className={styles.timelineEvent}>
        <div className={styles.timelineEventHeader}>
          <div className={styles.eventTypeRow}>
            <DirectionsCarIcon className={styles.eventIcon} />
            <span className={styles.eventType}>Driving</span>
          </div>
          {event.speed && <span className={styles.eventSpeed}>{event.speed}</span>}
        </div>
        {event.distance && <div className={styles.eventDistance}>{event.distance}</div>}
        {event.location && <div className={styles.eventLocation}>{event.location}</div>}
        {event.address && <div className={styles.eventAddress}>{event.address}</div>}
        <div className={styles.eventTimestamp}>
          {event.timeRange && (
            <span className={styles.eventTimeRange}>
              <FiberManualRecordIcon style={{ fontSize: 8, color: '#2563eb' }} />
              {event.timeRange}
            </span>
          )}
          {event.date && <span>{formatDate(event.date)}</span>}
        </div>
      </div>
    </div>
  );
}

function TimelineStopItem({ event }) {
  return (
    <div className={styles.timelineItem}>
      <div className={`${styles.timelineNode} ${styles.nodeRed}`}>
        <LocationOnIcon />
      </div>
      <div className={styles.timelineEvent}>
        <div className={styles.timelineEventHeader}>
          <div className={styles.eventTypeRow}>
            <LocationOnIcon className={styles.eventIcon} style={{ color: '#dc2626' }} />
            <span className={styles.eventType}>{event.duration || 'Stop'}</span>
          </div>
        </div>
        {event.location && <div className={styles.eventLocation}>{event.location}</div>}
        {event.address && <div className={styles.eventAddress}>{event.address}</div>}
        <div className={styles.eventTimestamp}>
          {event.timeRange && (
            <span className={styles.eventTimeRange}>
              <FiberManualRecordIcon style={{ fontSize: 8, color: '#dc2626' }} />
              {event.timeRange}
            </span>
          )}
          {event.date && <span>{formatDate(event.date)}</span>}
        </div>
      </div>
    </div>
  );
}

function TimelineAlertItem({ event }) {
  return (
    <div className={styles.timelineItem}>
      <div className={`${styles.timelineNode} ${styles.nodeOrange}`}>
        <WarningAmberIcon />
      </div>
      <div className={styles.timelineAlert}>
        <div className={styles.alertType}>{event.alertTitle || 'Alert'}</div>
        {event.alertMessage && <div className={styles.alertMessage}>{event.alertMessage}</div>}
        {event.date && <div className={styles.alertDate}>{formatDate(event.date)}</div>}
      </div>
    </div>
  );
}

const RENDERERS = {
  start: TimelineStartItem,
  driving: TimelineDrivingItem,
  stop: TimelineStopItem,
  alert: TimelineAlertItem,
};

export default function HistoryTimeline({ events = [] }) {
  return (
    <div className={styles.timelineCard}>
      <h3 className={styles.timelineTitle}>Timeline</h3>
      <div className={styles.timelineScroll}>
        {events.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 24 }}>
            No timeline events for the selected period.
          </p>
        ) : (
          <>
            {events.map((evt) => {
              const Renderer = RENDERERS[evt.type] || TimelineDrivingItem;
              return <Renderer key={evt.id} event={evt} />;
            })}
            <div className={styles.timelineEnd}>
              End of records for selected period
            </div>
          </>
        )}
      </div>
    </div>
  );
}
