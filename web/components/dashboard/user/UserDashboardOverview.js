import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DevicesIcon from '@mui/icons-material/Devices';
import SosIcon from '@mui/icons-material/Sos';
import styles from './UserDashboardOverview.module.css';
import { devicesService } from '../../../services/devicesService';

// Google Maps requires the DOM — disable SSR for this component
const LiveLocationMap = dynamic(
  () => import('./LiveLocationMap'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: '200px', background: '#eef2f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
        Loading map…
      </div>
    ),
  }
);

const usageData = [
  { name: 'Mon', value: 4, full: 8 },
  { name: 'Tue', value: 5, full: 8 },
  { name: 'Wed', value: 6, full: 8 },
  { name: 'Thur', value: 5, full: 8 },
  { name: 'Fri', value: 7, full: 8 },
];

const subscriptionData = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 500 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 450 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 800 },
];

export default function UserDashboardOverview() {
  const router = useRouter();
  const [devices, setDevices] = useState([]);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const deviceMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (deviceMenuRef.current && !deviceMenuRef.current.contains(e.target)) {
        setDeviceMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    devicesService
      .getFamilyDevices({ pairStatus: 'Paired' })
      .then((data) => setDevices(data.devices || []))
      .catch((err) => console.error('[Overview] fetch devices:', err));
  }, []);

  // Devices whose status is 'online'
  const activeDevices = devices.filter((d) => d.status === 'online');

  // Build avatar list: up to 3 unique assigned-user initials, then a +N badge
  const seen = new Set();
  const avatarUsers = [];
  for (const d of activeDevices) {
    const name = d.assignedUser?.name || d.name || '?';
    const key  = d.assignedUser?.id ?? name;
    if (!seen.has(key)) {
      seen.add(key);
      avatarUsers.push(name);
    }
  }
  const visibleAvatars = avatarUsers.slice(0, 3);
  const extraCount     = avatarUsers.length > 3 ? avatarUsers.length - 3 : 0;

  return (
    <div className={styles.container}>
      {/* Live Location Map */}
      <div className={styles.mapSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Live Location</h2>
          <span className={styles.detailsLink}>Details &gt;</span>
        </div>
        <div className={styles.mapPlaceholder}>
          <LiveLocationMap />
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`${styles.statIcon} ${styles.blue}`}>
                <DevicesIcon />
              </div>
              <span className={styles.statTitle}>Active Devices</span>
            </div>
            <div ref={deviceMenuRef} className={styles.menuWrapper}>
              <MoreVertIcon
                style={{ color: '#999', cursor: 'pointer' }}
                onClick={() => setDeviceMenuOpen((o) => !o)}
              />
              {deviceMenuOpen && (
                <div className={styles.dropdownMenu}>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => { setDeviceMenuOpen(false); router.push('/dashboard/devices'); }}
                  >
                    View all devices
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className={styles.avatars}>
              {visibleAvatars.length === 0 ? (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>No active devices</span>
              ) : (
                <>
                  {visibleAvatars.map((name, i) => (
                    <div key={i} className={styles.avatar} title={name}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {extraCount > 0 && (
                    <div className={styles.avatar}>+{extraCount}</div>
                  )}
                </>
              )}
            </div>
            <div className={styles.statValue}>{activeDevices.length}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`${styles.statIcon} ${styles.red}`}>
                <WarningAmberIcon />
              </div>
              <span className={styles.statTitle}>Alerts Today</span>
            </div>
            <MoreVertIcon style={{ color: '#999', cursor: 'pointer' }} />
          </div>
          <div className={styles.statValue} style={{ marginTop: '24px' }}>0</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`${styles.statIcon} ${styles.red}`}>
                <SosIcon />
              </div>
              <span className={styles.statTitle}>SOS Active</span>
            </div>
            <MoreVertIcon style={{ color: '#999', cursor: 'pointer' }} />
          </div>
          <div className={styles.statValue} style={{ marginTop: '24px' }}>0</div>
        </div>
      </div>

      <div className={styles.mainContentGrid}>
        <div className={styles.leftColumn}>
          {/* Charts Row */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>Usage Insight</h3>
              <div style={{ height: '200px' }}>
                <div className={styles.comingSoonWrapper}>
                  <span className={styles.comingSoonBadge}>Coming Soon</span>
                  <p className={styles.comingSoonLabel}>Usage analytics will appear here</p>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>Subscription</h3>
              <div style={{ height: '200px' }}>
                <div className={styles.comingSoonWrapper}>
                  <span className={styles.comingSoonBadge}>Coming Soon</span>
                  <p className={styles.comingSoonLabel}>Subscription trends will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Screen Time */}
          <div className={styles.screenTimeCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Screen Time</h3>
            </div>
            <div className={styles.comingSoonWrapper}>
              <span className={styles.comingSoonBadge}>Coming Soon</span>
              <p className={styles.comingSoonLabel}>Per-app screen time tracking is on its way</p>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Recent Activity */}
          <div className={styles.activityCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Activity / Alert Feeds</h3>
            </div>
            <div className={styles.comingSoonWrapper}>
              <span className={styles.comingSoonBadge}>Coming Soon</span>
              <p className={styles.comingSoonLabel}>Live activity and alert feeds will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
