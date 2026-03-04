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

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SearchIcon from '@mui/icons-material/Search';
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

// ── Mock data (replace with API calls) ──────────────────────────────────────

const MOCK_STATS = {
  distance: 850,
  stops: 150,
  alerts: 10,
  notifications: 10,
};

const MOCK_TIMELINE_EVENTS = [
  {
    id: 't1',
    type: 'start',
    time: '08:00 AM',
    label: 'Home Base',
  },
  {
    id: 't2',
    type: 'driving',
    distance: '5.2 miles',
    speed: 'Avg Speed: 35mph',
    timeRange: '07:00 - 07:30',
    date: new Date('2025-11-16'),
  },
  {
    id: 't3',
    type: 'stop',
    duration: 'STOP 1H 15M',
    location: 'Ikeja - City Mall',
    address: '123 Ikeja drive, Lagos',
    timeRange: '08:15 - 09:30 AM',
    date: new Date('2025-11-16'),
  },
  {
    id: 't4',
    type: 'driving',
    distance: '12.4 miles',
    speed: 'Avg Speed: 45mph',
    location: 'Tech Park Office',
    address: 'No 28 Odenke Avenue, Lagos',
    timeRange: '10:30 - 11:00AM',
    date: new Date('2025-11-16'),
  },
  {
    id: 't5',
    type: 'alert',
    alertTitle: 'GEOFENCE EXIT',
    alertMessage: 'User left unauthorized zone before business hours.',
    date: new Date('2025-11-16'),
  },
];

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

  // In production, these would come from API calls based on search.
  const stats = MOCK_STATS;
  const timelineEvents = MOCK_TIMELINE_EVENTS;
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
      {/* Search */}
      <div className={styles.searchBar}>
        <SearchIcon className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

        {/* Right column: Timeline */}
        <HistoryTimeline events={filteredTimeline} />
      </div>
    </div>
  );
}
