/**
 * HistoryReports
 * Main container for the "History & Reports" dashboard page.
 *
 * Layout (desktop):
 *  ┌─────────────────────────────────┬──────────────┐
 *  │  Search bar                     │              │
 *  │  [Stat] [Stat] [Stat] [Stat]    │  Timeline    │
 *  │  Live Location Map              │  (scrolls)   │
 *  │  Activity Trend  |  Reports     │              │
 *  └─────────────────────────────────┴──────────────┘
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import { devicesService } from '../../../../services/devicesService';
import styles from './HistoryReports.module.css';
import HistoryStatCards from './HistoryStatCards';
import HistoryTimeline from './HistoryTimeline';
import HistoryActivityTrend from './HistoryActivityTrend';
import HistoryReportsList from './HistoryReportsList';

// Dynamically import map to avoid SSR issues with Google Maps / Leaflet
const LiveLocationMap = dynamic(
  () => import('../LiveLocationMap'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.mapSkeleton}>
        Loading map…
      </div>
    ),
  }
);

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract only the street portion from a full address string.
 * Mirrors expo-location's `addr.street` — everything before the first comma.
 * e.g. "123 Main Street, Lagos, Nigeria" → "123 Main Street"
 */
function streetOnly(address) {
  if (!address) return '';
  return address.split(',')[0].trim();
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format a millisecond duration as "45 min" or "1h 30m". Returns null for < 1 min. */
function formatDuration(ms) {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 1) return null;
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Transform raw location-history entries into timeline events.
 *
 * Consecutive pings within CLUSTER_RADIUS_KM of each other are merged into
 * a single "place" visit (Google Maps Timeline style). Between distinct places
 * a lightweight "travel" connector is emitted.
 */
function buildTimelineEvents(historyEntries = []) {
  if (!historyEntries.length) return [];

  const CLUSTER_RADIUS_KM = 0.10; // 100 m — pings within this radius = same place

  const sorted = [...historyEntries].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Build clusters of spatially-close consecutive pings
  const clusters = [];
  let cluster = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = cluster[cluster.length - 1];
    const curr = sorted[i];
    if (haversineKm(prev.latitude, prev.longitude, curr.latitude, curr.longitude) <= CLUSTER_RADIUS_KM) {
      cluster.push(curr);
    } else {
      clusters.push(cluster);
      cluster = [curr];
    }
  }
  clusters.push(cluster);

  const events = [];
  let idCounter = 1;

  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i];
    const first = c[0];
    const last = c[c.length - 1];

    // Use the best available address in the cluster
    const addressPing = c.find((p) => p.address) || first;
    const name = streetOnly(addressPing.address) || 'Unknown location';

    const arrivedAt = format(new Date(first.timestamp), 'hh:mm a');
    const leftAt = format(new Date(last.timestamp), 'hh:mm a');
    const durationMs = new Date(last.timestamp) - new Date(first.timestamp);

    events.push({
      id: `te_${idCounter++}`,
      type: 'place',
      name,
      arrivedAt,
      leftAt,
      duration: formatDuration(durationMs),
      date: new Date(first.timestamp),
    });

    // Travel connector to next place
    if (i < clusters.length - 1) {
      const nextFirst = clusters[i + 1][0];
      const distKm = haversineKm(
        last.latitude, last.longitude,
        nextFirst.latitude, nextFirst.longitude
      );
      const travelMs = new Date(nextFirst.timestamp) - new Date(last.timestamp);
      events.push({
        id: `te_${idCounter++}`,
        type: 'travel',
        distance: distKm >= 1 ? `${distKm.toFixed(1)} km` : `${Math.round(distKm * 1000)} m`,
        duration: formatDuration(travelMs),
        timeRange: `${leftAt} – ${format(new Date(nextFirst.timestamp), 'hh:mm a')}`,
        date: new Date(last.timestamp),
      });
    }
  }

  return events;
}

/**
 * Derive simple stats from the location history entries.
 */
function deriveStats(historyEntries = []) {
  if (!historyEntries.length) return { distance: 0, stops: 0, alerts: 0, notifications: 0 };

  const sorted = [...historyEntries].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  let totalDistKm = 0;
  for (let i = 1; i < sorted.length; i++) {
    totalDistKm += haversineKm(
      sorted[i - 1].latitude, sorted[i - 1].longitude,
      sorted[i].latitude, sorted[i].longitude
    );
  }

  // Count distinct place visits (clusters of pings within 100 m of each other)
  const CLUSTER_RADIUS_KM = 0.10;
  let places = sorted.length > 0 ? 1 : 0;
  for (let i = 1; i < sorted.length; i++) {
    if (haversineKm(sorted[i - 1].latitude, sorted[i - 1].longitude, sorted[i].latitude, sorted[i].longitude) > CLUSTER_RADIUS_KM) {
      places++;
    }
  }

  return {
    distance: Math.round(totalDistKm),
    stops: places,
    alerts: 0,
    notifications: 0,
  };
}

// ── Fallback mock data (used when API returns nothing) ──────────────────────

const MOCK_ACTIVITY_DATA = [
  { name: 'Mon', value: 3 },
  { name: 'Tue', value: 5 },
  { name: 'Wed', value: 4.5 },
  { name: 'Thur', value: 8 },
];

const MOCK_REPORTS = [
  { id: 'r1', date: 'July 15, 2019', user: '(Casual)', category: 'transit' },
  { id: 'r2', date: 'July 15, 2019', user: '(Casual)', category: 'work' },
  { id: 'r3', date: 'July 15, 2019', user: '(Casual)', category: 'home' },
];

// ── Component ───────────────────────────────────────────────────────────────

export default function HistoryReports() {
  const [search, setSearch] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [historyEntries, setHistoryEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch family devices on mount ─────────────────────────────────────────
  useEffect(() => {
    devicesService
      .getFamilyDevices()
      .then((data) => {
        const list = data.devices || [];
        setDevices(list);
        if (list.length > 0) setSelectedDeviceId(String(list[0].id));
      })
      .catch((err) => console.error('[HistoryReports] fetch devices:', err));
  }, []);

  // ── Fetch location history when device changes ────────────────────────────
  useEffect(() => {
    if (!selectedDeviceId) return;
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await devicesService.getLocationHistory({
          deviceId: selectedDeviceId,
        });
        if (!cancelled) {
          setHistoryEntries(data.history || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[HistoryReports] fetch history:', err);
          setError(err.message);
          setHistoryEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => { cancelled = true; };
  }, [selectedDeviceId]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const stats = useMemo(() => deriveStats(historyEntries), [historyEntries]);
  const timelineEvents = useMemo(() => buildTimelineEvents(historyEntries), [historyEntries]);
  const activityData = MOCK_ACTIVITY_DATA;
  const reports = MOCK_REPORTS;

  // Filter timeline by search term
  const filteredTimeline = useMemo(() => {
    if (!search.trim()) return timelineEvents;
    const q = search.toLowerCase();
    return timelineEvents.filter((evt) => {
      const searchable = [
        evt.name,          // place event
        evt.distance,      // travel event
        evt.alertTitle,
        evt.alertMessage,
        evt.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [search, timelineEvents]);

  // Total activity minutes for badge
  const totalMinutes = useMemo(() => {
    const totalHours = activityData.reduce((sum, d) => sum + (d.value || 0), 0);
    return Math.round(totalHours * 60);
  }, [activityData]);

  const handleSeeAllReports = useCallback(() => {
    // TODO: Navigate to full reports view or open modal
    console.log('See all reports clicked');
  }, []);

  return (
    <div className={styles.container}>
      {/* Search + Device selector */}
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <SearchIcon className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {devices.length > 0 && (
          <select
            className={styles.deviceSelect}
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.deviceName || d.name || `Device ${d.id}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main grid: left content + right timeline */}
      <div className={styles.mainGrid}>
        {/* Left column */}
        <div className={styles.leftColumn}>
          {/* Stat cards */}
          <HistoryStatCards stats={stats} loading={loading} />

          {/* Live Location Map */}
          {/* <div className={styles.mapSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Live Location</h2>
              <span className={styles.detailsLink}>Details &gt;</span>
            </div>
            <div className={styles.mapPlaceholder}>
              <LiveLocationMap />
            </div>
          </div> */}

          {/* Bottom row: Activity Trend + Reports */}
          <div className={styles.bottomRow}>
            <HistoryActivityTrend data={activityData} totalMinutes={totalMinutes} />
            <HistoryReportsList reports={reports} onSeeAll={handleSeeAllReports} />
          </div>
        </div>

        {/* Right column: Timeline (wrapper caps height to left column) */}
        <div className={styles.timelineColumn}>
          <HistoryTimeline events={filteredTimeline} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
