import { useState } from 'react';
import Image from 'next/image';
import { 
  Search as SearchIcon, 
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import styles from './SubscriptionManagement.module.css';

export default function SubscriptionManagement() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock Data
  const stats = {
    total: 15,
    active: 10,
    upcoming: 2,
    expired: 1
  };

  const subscribers = [
    {
      id: 1,
      name: "Sharon Bliss",
      email: "sharonbliss9@gmail.com",
      phone: "08160232043",
      datePayment: "07-08-2025",
      status: "Due in 4 days",
      statusType: "due",
      plan: "Personal Plan",
      startedAt: "02-10-2025",
      endsAt: "02-11-2025",
      paymentHistory: { date: "07-08-2025", plan: "Personal Plan" }
    },
    {
      id: 2,
      name: "Nneka Amadi",
      email: "nnekaamadi45@gmail.com",
      phone: "09058394839",
      datePayment: "07-08-2025",
      status: "Active",
      statusType: "active",
      plan: "Family Plan",
      startedAt: "01-09-2025",
      endsAt: "01-10-2025",
      paymentHistory: { date: "07-08-2025", plan: "Family Plan" }
    },
    {
      id: 3,
      name: "Chidiebere British",
      email: "chidieberebritish@gmail.com",
      phone: "08160232043",
      datePayment: "07-08-2025",
      status: "Over due by 1 day",
      statusType: "overdue",
      plan: "Premium Tier",
      startedAt: "05-07-2025",
      endsAt: "05-08-2025",
      paymentHistory: { date: "07-08-2025", plan: "Premium Tier" }
    },
    {
      id: 4,
      name: "Kelvin Chidi",
      email: "kelvinchidi@gmail.com",
      phone: "07-08-2025",
      datePayment: "07-08-2025",
      status: "Due in 4 days",
      statusType: "due",
      plan: "Personal Plan",
      startedAt: "15-09-2025",
      endsAt: "15-10-2025",
      paymentHistory: { date: "07-08-2025", plan: "Personal Plan" }
    },
    {
      id: 5,
      name: "Chidi Victor",
      email: "chidivictor@gmail.com",
      phone: "07-08-2025",
      datePayment: "07-08-2025",
      status: "Active",
      statusType: "active",
      plan: "Personal Plan",
      startedAt: "20-09-2025",
      endsAt: "20-10-2025",
      paymentHistory: { date: "07-08-2025", plan: "Personal Plan" }
    }
  ];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMessage = (user) => {
    setSnackbar({ open: true, message: `Messaging ${user.name}...`, severity: 'info' });
  };

  const handleCancelSubscription = (userId) => {
    // In a real app, this would make an API call
    setSnackbar({ open: true, message: `Subscription for user ${userId} cancelled.`, severity: 'success' });
    setSelectedUser(null);
  };

  const calculateDaysLeft = (endsAt) => {
    // Mock calculation for demo purposes
    return "4 days left"; 
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesTab = activeTab === 'All' || 
      (activeTab === 'Active' && sub.statusType === 'active') ||
      (activeTab === 'Expired' && sub.statusType === 'overdue');
    
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusIcon = (type) => {
    switch(type) {
      case 'active': return <CheckCircleIcon style={{ fontSize: 16 }} />;
      case 'overdue': return <CancelIcon style={{ fontSize: 16 }} />;
      case 'due': return <AccessTimeIcon style={{ fontSize: 16 }} />;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.green}`}>
            <PersonIcon />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>{stats.total}</p>
            <p className={styles.statLabel}>Total Subscription</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.blue}`}>
            <DescriptionIcon />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>{stats.active}</p>
            <p className={styles.statLabel}>Active Subscription</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.gray}`}>
            <EventIcon />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>{stats.upcoming}</p>
            <p className={styles.statLabel}>Upcoming Renewals</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.red}`}>
            <CreditCardIcon />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>{stats.expired}</p>
            <p className={styles.statLabel}>Expired Subscription</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.contentArea}>
        <div className={styles.header}>
          <h2 className={styles.title}>All Subscribers</h2>
          <div className={styles.controls}>
            <div className={styles.tabs}>
              {['All', 'Active', 'Expired'].map(tab => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.searchContainer}>
              <SearchIcon className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Date Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map(sub => (
                <tr key={sub.id} className={styles.row} onClick={() => setSelectedUser(sub)} style={{ cursor: 'pointer' }}>
                  <td>
                    <input type="checkbox" className={styles.checkbox} onClick={(e) => e.stopPropagation()} />
                  </td>
                  <td>{sub.name}</td>
                  <td>{sub.email}</td>
                  <td>{sub.phone}</td>
                  <td>{sub.datePayment}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[sub.statusType]}`}>
                      {getStatusIcon(sub.statusType)}
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn}>
                      <MoreVertIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Drawer */}
      {selectedUser && (
        <div className={styles.overlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Details</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
                <CloseIcon />
              </button>
            </div>

            <div className={styles.section}>
              <div className={styles.appCard}>
                <h4 className={styles.appName}>Sentinelr</h4>
                <p className={styles.appType}>Web Application</p>
              </div>
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Plan Details</h4>
              <div className={styles.planCard}>
                <div className={styles.planHeader}>
                  <div>
                    <h5 className={styles.planName}>Sentinelr</h5>
                    <p className={styles.planType}>{selectedUser.plan}</p>
                  </div>
                  <button className={styles.changePlanBtn} onClick={() => {setShowPlanModal(true); setSelectedUser(null)}}>
                    Change Plan
                  </button>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Active</span>
                  <span className={styles.detailValue}>{calculateDaysLeft(selectedUser.endsAt)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Started At</span>
                  <span className={styles.detailValue}>{selectedUser.startedAt}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Ends At</span>
                  <span className={styles.detailValue}>{selectedUser.endsAt}</span>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Payment History</h4>
              <div className={styles.paymentHistoryCard}>
                <h5 className={styles.paymentDate}>{selectedUser.paymentHistory?.date || 'N/A'}</h5>
                <p className={styles.paymentPlan}>{selectedUser.paymentHistory?.plan || 'N/A'}</p>
              </div>
            </div>

            <div className={styles.drawerActions}>
              <button className={styles.primaryBtn} onClick={() => handleMessage(selectedUser)}>Message {selectedUser.name.split(' ')[0]}</button>
              <button className={styles.secondaryBtn} onClick={() => handleCancelSubscription(selectedUser.id)}>Cancel Subscription</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showPlanModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPlanModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Choose The Plan That Is Best Suitable For You.</h2>
            <p className={styles.modalSubtitle}>
              Our clear pricing makes it simple to select a package that<br />
              works within your financial constraints.
            </p>

            <div className={styles.plansGrid}>
              <div className={styles.planOption}>
                <h3 className={styles.planOptionTitle}>Personal Plan</h3>
                <p className={styles.planOptionDesc}>Best for individuals testing their first application booking.</p>
                <div className={styles.planPrice}>$3-10<span>/hour</span></div>
                <button className={`${styles.selectPlanBtn} ${styles.outline}`}>Get Started</button>
                <p className={styles.includesLabel}>Includes:</p>
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Full Security</li>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Limited to just on device</li>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Including intruder alerts & history</li>
                </ul>
              </div>

              <div className={`${styles.planOption} ${styles.featured}`}>
                <h3 className={styles.planOptionTitle}>Family Plan</h3>
                <p className={styles.planOptionDesc}>Best for group of individuals testing their first mentorship booking.</p>
                <div className={styles.planPrice}>$10-25<span>/month</span></div>
                <button className={`${styles.selectPlanBtn} ${styles.filled}`}>Get Started</button>
                <p className={styles.includesLabel}>Includes:</p>
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Full Security for</li>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Connect up to 3 tools</li>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Tasks after a session</li>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Access to prebuilt templates</li>
                </ul>
              </div>

              <div className={styles.planOption}>
                <h3 className={styles.planOptionTitle}>Premium Tier</h3>
                <p className={styles.planOptionDesc}>Best for individuals testing their first mentorship booking.</p>
                <div className={styles.planPrice}>Custom <span>pricing</span></div>
                <button className={`${styles.selectPlanBtn} ${styles.outline}`}>Contact Us</button>
                <p className={styles.includesLabel}>Includes:</p>
                <ul className={styles.featuresList}>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> 1 active mentee</li>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Connect up to 3 tools</li>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Tasks after a session</li>
                  <li className={styles.featureItem}><Image src="/assets/icons/check.png" alt="check" width={16} height={16} className={styles.checkIcon} /> Access to prebuilt templates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
