/**
 * HistoryTimeline
 * Right-hand timeline sidebar — Google Maps Timeline style.
 * Events are either "place" (clustered stay) or "travel" (movement between places).
 */

import React from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { format } from 'date-fns';
import styles from './HistoryReports.module.css';
import { CardSkeleton } from '../../../ui/loaders';

/**
 * Expected event shapes:
 *
 * place:
 *   { id, type:'place', name, arrivedAt, leftAt, duration?, date }
 *
 * travel:
 *   { id, type:'travel', distance, duration?, timeRange, date }
 *
 * alert:
 *   { id, type:'alert', alertTitle?, alertMessage?, date }
 */

function formatDate(d) {
  if (!d) return '';
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return format(dt, 'MMM d');
  } catch {
    return '';
  }
}

/** A visited place — prominent card with pin icon, name, time range, duration chip */
function PlaceItem({ event }) {
  const timeLabel =
    event.arrivedAt === event.leftAt
      ? event.arrivedAt
      : `${event.arrivedAt} – ${event.leftAt}`;

  return (
    <div className={styles.timelineItem}>
      <div className={`${styles.timelineNode} ${styles.nodeBlue}`}>
        <LocationOnIcon />
      </div>
      <div
        className={styles.timelineEvent}
        style={{ borderColor: '#ede7ff', background: '#fbf9ff' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: '#111827',
              lineHeight: 1.3,
            }}
          >
            {event.name}
          </span>
          {event.duration && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#3d09d0',
                background: '#ede7ff',
                borderRadius: 5,
                padding: '2px 7px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {event.duration}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{timeLabel}</span>
          {event.date && (
            <span style={{ color: '#d1d5db' }}>·</span>
          )}
          {event.date && (
            <span style={{ color: '#9ca3af' }}>{formatDate(event.date)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** A travel segment — compact connector row, no heavy card */
function TravelItem({ event }) {
  const parts = [event.distance, event.duration].filter(Boolean).join(' · ');
  return (
    <div className={styles.timelineItem} style={{ paddingBottom: 12 }}>
      <div
        className={`${styles.timelineNode} ${styles.nodeGray}`}
        style={{ background: '#f3f4f6' }}
      >
        <DirectionsCarIcon style={{ fontSize: 10, color: '#9ca3af' }} />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          paddingTop: 1,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
          {parts}
        </span>
        {event.timeRange && (
          <span style={{ fontSize: 11, color: '#d1d5db' }}>
            · {event.timeRange}
          </span>
        )}
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
        {event.alertMessage && (
          <div className={styles.alertMessage}>{event.alertMessage}</div>
        )}
        {event.date && (
          <div className={styles.alertDate}>{formatDate(event.date)}</div>
        )}
      </div>
    </div>
  );
}

const RENDERERS = {
  place: PlaceItem,
  travel: TravelItem,
  alert: TimelineAlertItem,
};

export default function HistoryTimeline({ events = [], loading = false, error = null }) {
  return (
    <div className={styles.timelineCard}>
      <h3 className={styles.timelineTitle}>Timeline</h3>
      <div className={styles.timelineScroll}>
        {loading ? (
          <CardSkeleton variant="compact" count={4} />
        ) : error ? (
          <p style={{ fontSize: 13, color: '#dc323f', textAlign: 'center', marginTop: 24 }}>
            {error}
          </p>
        ) : events.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 24 }}>
            No timeline events for the selected period.
          </p>
        ) : (
          <>
            {events.map((evt) => {
              const Renderer = RENDERERS[evt.type];
              return Renderer ? <Renderer key={evt.id} event={evt} /> : null;
            })}
            <div className={styles.timelineEnd}>End of records</div>
          </>
        )}
      </div>
    </div>
  );
}
