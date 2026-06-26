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
      <div className={`${styles.timelineEvent} ${styles.timelinePlaceEvent}`}>
        <div className={styles.placeEventHeader}>
          <span className={styles.placeEventName}>
            {event.name}
          </span>
          {event.duration && (
            <span className={styles.placeDuration}>
              {event.duration}
            </span>
          )}
        </div>
        <div className={styles.placeTimeRow}>
          <span>{timeLabel}</span>
          {event.date && (
            <span className={styles.timelineSeparator}>·</span>
          )}
          {event.date && (
            <span className={styles.timelineDate}>{formatDate(event.date)}</span>
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
    <div className={`${styles.timelineItem} ${styles.timelineTravelItem}`}>
      <div className={`${styles.timelineNode} ${styles.nodeGray}`}>
        <DirectionsCarIcon className={styles.travelIcon} />
      </div>
      <div className={styles.travelContent}>
        <span className={styles.travelParts}>
          {parts}
        </span>
        {event.timeRange && (
          <span className={styles.travelTimeRange}>
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
          <p className={`${styles.timelineState} ${styles.timelineStateError}`}>
            {error}
          </p>
        ) : events.length === 0 ? (
          <p className={styles.timelineState}>
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
