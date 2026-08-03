import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useAlertsSubscription } from '../../context/RealtimeSubscriptionContext';
import Sidebar from './Sidebar';
import BottomAppBar from './BottomAppBar';
import PageHeader from './PageHeader';
import styles from './DashboardLayout.module.css';
import UserBackground from './backgrounds/UserBackground';
import { alertsService } from '../../services/alertsService';

const pageConfig = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Personal sentinelr overview dashboard',
    icon: '/assets/icons/layout-grid.png'
  },
  '/dashboard/alerts': {
    title: 'Sos Alert',
    subtitle: 'Personal sentinelr overview dashboard',
    icon: '/assets/icons/megaphone.png'
  },
  '/dashboard/subscription': {
    title: 'Subscription',
    subtitle: 'Choose subscription plan suitable for you',
    icon: '/assets/icons/bank-card.png'
  },
  '/dashboard/settings': {
    title: 'Settings',
    subtitle: 'Manage and update your SENTINELR account information',
    icon: '/assets/icons/settings.png'
  },
  '/dashboard/devices': {
    title: 'Devices & Users',
    subtitle: 'Manage devices and users',
    icon: '/assets/icons/user.png'
  },
  '/dashboard/history': {
    title: 'History & Reports',
    subtitle: 'View history and reports',
    icon: '/assets/icons/line-chart.png'
  },
  '/dashboard/parental': {
    title: 'Parental Control',
    subtitle: 'Personal sentinelr overview dashboard',
    icon: '/assets/icons/user.png'
  },
  '/dashboard/geofencing': {
    title: 'Geofencing',
    subtitle: 'Personal sentinelr overview dashboard',
    icon: '/assets/icons/layout-grid.png'
  },
  '/dashboard/insights': {
    title: 'Usage Insights',
    subtitle: 'An overview of usage your applications',
    icon: '/assets/icons/line-chart.png'
  }
};

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth > 768;
    return true;               // SSR fallback (desktop)
  });
  const router = useRouter();
  const { user, loggedUser, logout } = useAuth();
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  // On mobile, user-role accounts use the BottomAppBar – never show the sidebar
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth <= 768;
    return false;
  });
  const prevIsMobileRef = useRef(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const showSidebar = !isMobile;
  
  let currentPage = pageConfig[router.pathname] || pageConfig['/dashboard'];

  // Active alert count for the notification bell — fetched on mount
  // and kept up-to-date via the centralized Alerts realtime subscription.
  const fetchActiveAlertCount = useCallback(async (silent = false) => {
    if (!user) return;
    try {
      const data = await alertsService.getAlerts({ status: 'active', limit: 50 });
      const alerts = data?.alerts || [];
      setActiveAlertCount(alerts.filter((a) => {
        const s = (a.status || '').toLowerCase();
        return s === 'active' || s === 'unresolved';
      }).length);
    } catch {
      if (!silent) { /* ignore silently on realtime refresh */ }
    }
  }, [user]);

  useEffect(() => {
    fetchActiveAlertCount();
  }, [fetchActiveAlertCount]);

  // Subscribe to Alerts table changes so the bell badge stays current
  useAlertsSubscription(() => {
    fetchActiveAlertCount(true);
  }, [fetchActiveAlertCount]);

  // Auto-close sidebar on mobile, auto-open when returning to desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const wasMobile = prevIsMobileRef.current;
      prevIsMobileRef.current = mobile;
      setIsMobile(mobile);
      if (wasMobile && !mobile) {
        // Transitioning mobile → desktop: restore sidebar
        setIsSidebarOpen(true);
      } else if (!wasMobile && mobile) {
        // Transitioning desktop → mobile: hide sidebar
        setIsSidebarOpen(false);
      }
      // No change when resizing within the same category (preserves manual toggle)
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [router.pathname]);

  return (
    <div className={styles.layout}>
      <UserBackground />
      
      <div className={styles.dashboardContainer}>
        {showSidebar && isSidebarOpen && (
          <div
            className={styles.overlay}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        {showSidebar && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
        
        <div className={`${styles.mainContent} ${!isSidebarOpen || !showSidebar ? styles.mainContentExpanded : ''}`}>
          <PageHeader 
            title={currentPage?.title} 
            subtitle={currentPage?.subtitle}
            icon={currentPage?.icon}
            user={loggedUser || user}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isAdmin={false}
            activeAlertCount={activeAlertCount}
            onLogout={() => { logout(); router.push('/login'); }}
          />
          
          <main className={styles.pageContent}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation – users only */}
      <BottomAppBar activeAlertCount={activeAlertCount} />
    </div>
  );
}
