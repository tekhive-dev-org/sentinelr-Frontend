import React from 'react';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DevicesIcon from '@mui/icons-material/Devices';
import SosIcon from '@mui/icons-material/Sos';
import styles from './UserDashboardOverview.module.css';

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
  return (
    <div className={styles.container}>
      {/* Live Location Map */}
      <div className={styles.mapSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Live Location</h2>
          <span className={styles.detailsLink}>Details &gt;</span>
        </div>
        <div className={styles.mapPlaceholder}>
          {/* Placeholder for map image - using a colored div for now if image fails */}
          <div style={{ width: '100%', height: '100%', background: '#e0e0e0' }}></div> 
          <div className={styles.mapWarning}>Please add a device first</div>
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
            <MoreVertIcon style={{ color: '#999', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className={styles.avatars}>
              <div className={styles.avatar}>A</div>
              <div className={styles.avatar}>B</div>
              <div className={styles.avatar}>+2</div>
            </div>
            <div className={styles.statValue}>5</div>
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
          <div className={styles.statValue} style={{ marginTop: '24px' }}>2</div>
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
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="full" stackId="a" fill="#f3f4f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="value" stackId="a" fill="#818cf8" radius={[4, 4, 0, 0]} style={{ transform: 'translateY(-100%)' }} /> 
                    {/* Note: Recharts stacking can be tricky to get exact overlay look, using simple stack for now */}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.sectionTitle} style={{ marginBottom: '16px' }}>Subscription</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={subscriptionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                    <YAxis hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Screen Time */}
          <div className={styles.screenTimeCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Screen Time</h3>
                <p className={styles.subtitle}>Total screen time consumed today is <strong>3h 45m</strong></p>
              </div>
              <MoreVertIcon style={{ color: '#999', cursor: 'pointer' }} />
            </div>
            
            <div className={styles.appItem}>
              <div className={styles.appInfo}>
                <span className={styles.appName}>Videos Viewed</span>
                <span style={{ fontSize: '12px', color: '#666' }}>365</span>
              </div>
              <div className={styles.appInfo}>
                <span style={{ fontSize: '12px', color: '#666' }}>Time Spent</span>
                <span className={styles.appTime}>3h 45m</span>
              </div>
              <div style={{ width: '40px', height: '40px', background: 'red', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>YT</div>
            </div>

            <div className={styles.appItem} style={{ borderBottom: 'none' }}>
              <div className={styles.appInfo}>
                <span className={styles.appName}>Videos Viewed</span>
                <span style={{ fontSize: '12px', color: '#666' }}>265</span>
              </div>
              <div className={styles.appInfo}>
                <span style={{ fontSize: '12px', color: '#666' }}>Time Spent</span>
                <span className={styles.appTime}>2h 15m</span>
              </div>
              <div style={{ width: '40px', height: '40px', background: 'black', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>TT</div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Recent Activity */}
          <div className={styles.activityCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Activity/Alert feeds</h3>
              <MoreVertIcon style={{ color: '#999', cursor: 'pointer' }} />
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityHeader}>
                <span className={styles.activityTitle}>Intruder Alert - Today</span>
                <span className={styles.activityTime}>9:00 AM</span>
              </div>
              <div className={styles.activityStatus}>
                <span className={`${styles.statusBadge} ${styles.cancelled}`}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'red' }}></span>
                  Cancelled
                </span>
                <span>Nov 16, 2025</span>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityHeader}>
                <span className={styles.activityTitle}>Geofence Exit- John, school</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>2:30 PM - 4:00 PM</div>
              <div className={styles.activityStatus}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#666' }}></span>
                  3 days late
                </span>
                <span>Nov 24, 2025</span>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityHeader}>
                <span className={styles.activityTitle}>Geofence Exit- John, school</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>2:30 PM - 4:00 PM</div>
              <div className={styles.activityStatus}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#666' }}></span>
                  3 days late
                </span>
                <span>Nov 24, 2025</span>
              </div>
            </div>
            
            <div className={styles.activityItem}>
              <div className={styles.activityHeader}>
                <span className={styles.activityTitle}>Geofence Exit- John, school</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>2:30 PM - 4:00 PM</div>
              <div className={styles.activityStatus}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#666' }}></span>
                  3 days late
                </span>
                <span>Nov 24, 2025</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
