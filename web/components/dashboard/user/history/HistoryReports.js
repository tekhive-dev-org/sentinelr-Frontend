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
      <div
        style={{
          height: '260px',
          background: '#eef2f6',
          borderRadius: '8px',
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

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Transform raw location-history entries into timeline events.
 * Each location point becomes a "stop" event.
 * When two consecutive points are far enough apart, a "driving" segment is
 * inserted between them (Haversine distance > 50 m).
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildTimelineEvents(historyEntries = []) {
  if (!historyEntries.length) return [];

  // Sort oldest → newest so the timeline reads chronologically
  const sorted = [...historyEntries].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const events = [];
  let idCounter = 1;

  // First entry → "start" marker
  const first = sorted[0];
  events.push({
    id: `te_${idCounter++}`,
    type: 'start',
    time: format(new Date(first.timestamp), 'hh:mm a'),
    label: first.address || `${first.latitude.toFixed(4)}, ${first.longitude.toFixed(4)}`,
  });

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const dist = haversineKm(prev.latitude, prev.longitude, curr.latitude, curr.longitude);

    // Insert a "driving" segment between non-trivial moves (> 50 m)
    if (dist > 0.05) {
      const prevTime = format(new Date(prev.timestamp), 'hh:mm a');
      const currTime = format(new Date(curr.timestamp), 'hh:mm a');
      events.push({
        id: `te_${idCounter++}`,
        type: 'driving',
        distance: dist >= 1 ? `${dist.toFixed(1)} km` : `${Math.round(dist * 1000)} m`,
        speed: '',
        timeRange: `${prevTime} - ${currTime}`,
        date: new Date(curr.timestamp),
      });
    }

    // Each location point → "stop" event
    events.push({
      id: `te_${idCounter++}`,
      type: 'stop',
      location: curr.address || `${curr.latitude.toFixed(4)}, ${curr.longitude.toFixed(4)}`,
      address: curr.address || '',
      timeRange: format(new Date(curr.timestamp), 'hh:mm a'),
      date: new Date(curr.timestamp),
    });
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

  return {
    distance: Math.round(totalDistKm),
    stops: sorted.length,
    alerts: 0,         // populated from alerts API later
    notifications: 0,  // populated from alerts API later
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
        evt.label,
        evt.location,
        evt.address,
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
          <HistoryStatCards stats={stats} />

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
