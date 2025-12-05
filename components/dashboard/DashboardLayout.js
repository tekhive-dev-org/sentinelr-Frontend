import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import styles from './DashboardLayout.module.css';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

const pageConfig = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Manage all users available on Sentinelr',
    icon: '/assets/icons/layout-grid.png'
  },
  '/dashboard/users': {
    title: 'Users & Family Management',
    subtitle: 'Manage all users available on Sentinelr',
    icon: '/assets/icons/user.png'
  },
  '/dashboard/analytics': {
    title: 'Analytics Management',
    subtitle: 'Manage all users available on Sentinelr',
    icon: '/assets/icons/line-chart.png'
  },
  '/dashboard/alerts': {
    title: 'Alert & Report Handling',
    subtitle: 'Manage all users available on Sentinelr',
    icon: '/assets/icons/megaphone.png'
  },
  '/dashboard/content': {
    title: 'Content Management',
    subtitle: 'Manage all users available on Sentinelr',
    icon: DescriptionOutlinedIcon
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
    icon: '/assets/icons/line-chart.png' // Using line-chart as placeholder
  },
  '/dashboard/parental': {
    title: 'Parental Control',
    subtitle: 'Manage parental control settings',
    icon: '/assets/icons/user.png' // Using user as placeholder
  },
  '/dashboard/geofencing': {
    title: 'Geofencing',
    subtitle: 'Manage geofencing zones',
    icon: '/assets/icons/layout-grid.png' // Using layout-grid as placeholder
  },
  '/dashboard/insights': {
    title: 'Usage Insights',
    subtitle: 'View usage insights',
    icon: '/assets/icons/line-chart.png'
  }
};

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  
  let currentPage = pageConfig[router.pathname] || pageConfig['/dashboard'];

  // Override subtitle for user dashboard
  if (router.pathname === '/dashboard' && user?.role !== 'admin') {
    currentPage = {
      ...currentPage,
      subtitle: 'Personal sentinelr overview dashboard'
    };
  }

  // Override title/subtitle for admin subscription page
  if (router.pathname === '/dashboard/subscription' && user?.role === 'admin') {
    currentPage = {
      ...currentPage,
      title: 'Subscription Management',
      subtitle: 'Manage all users available on Sentinelr'
    };
  }

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
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
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`${styles.mainContent} ${!isSidebarOpen ? styles.mainContentExpanded : ''}`}>
        <PageHeader 
          title={currentPage?.title} 
          subtitle={currentPage?.subtitle}
          icon={currentPage?.icon}
          user={user}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
