import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from './DashboardOverview.module.css';

export default function DashboardOverview() {
  const [userData] = useState({
    allUsers: 0,
    approvedAccounts: 0,
    blockedAccounts: 0,
    flaggedUsers: 0
  });

  const [users] = useState([
    {
      id: 1,
      name: 'Sharon Bliss',
      email: 'sharonbliss9@gmail.com',
      phone: '08160032043',
      lastActive: '07-08-2025',
      status: 'Flagged'
    },
    {
      id: 2,
      name: 'Nneka Amadi',
      email: 'nnekaamadi45@gmail.com',
      phone: '09058394839',
      lastActive: '07-08-2025',
      status: 'Approved'
    },
    {
      id: 3,
      name: 'Chidiebere British',
      email: 'chidieberebritish@gmail.com',
      phone: '08160032043',
      lastActive: '07-08-2025',
      status: 'Blocked'
    }
  ]);

  const [activeTab, setActiveTab] = useState('All');

  const subscriptionData = [
    { name: 'Mon', value: 500 },
    { name: 'Tue', value: 150 },
    { name: 'Wed', value: 450 },
    { name: 'Thur', value: 100 },
    { name: 'Fri', value: 750 }
  ];

  const analyticsData = [
    { name: 'Jan', value: 250 },
    { name: 'Mar', value: 650 },
    { name: 'May', value: 200 },
    { name: 'July', value: 600 },
    { name: 'Sep', value: 850 }
  ];

  return (
    <div className={styles.dashboardOverview}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>All Users</h3>
          <p className={styles.statValue}>{userData.allUsers}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Approved Accounts</h3>
          <p className={styles.statValue}>{userData.approvedAccounts}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Blocked Accounts</h3>
          <p className={styles.statValue}>{userData.blockedAccounts}</p>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Flagged Users</h3>
          <p className={styles.statValue}>{userData.flaggedUsers}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Subscription</h3>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subscriptionData}>
                <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  domain={[0, 800]}
                  ticks={[0, 200, 400, 600, 800]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Analytics- Real-time device usage</h3>
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  domain={[0, 900]}
                  ticks={[0, 250, 500, 750, 900]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>All Users</h3>
        </div>

        <div className={styles.tableTabs}>
          {['All', 'Approved', 'Blocked', 'Flagged'].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Last active</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.lastActive}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[user.status.toLowerCase()]}`}>
                      <span className={styles.statusDot}></span>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.moreBtn}>
                      <MoreVertIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
