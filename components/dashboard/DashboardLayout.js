import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import styles from './DashboardLayout.module.css';

const pageConfig = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Manage all users available on Sentinelr'
  },
  '/dashboard/users': {
    title: 'Dashboard',
    subtitle: 'Manage all users available on Sentinelr'
  },
  '/dashboard/analytics': {
    title: 'Dashboard',
    subtitle: 'Manage all users available on Sentinelr'
  },
  '/dashboard/alerts': {
    title: 'Dashboard',
    subtitle: 'Manage all users available on Sentinelr'
  },
  '/dashboard/content': {
    title: 'Dashboard',
    subtitle: 'Manage all users available on Sentinelr'
  },
  '/dashboard/subscription': {
    title: 'Dashboard',
    subtitle: 'Manage all users available on Sentinelr'
  },
  '/dashboard/settings': {
    title: 'Dashboard',
    subtitle: 'Manage all users available on Sentinelr'
  }
};

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const currentPage = pageConfig[router.pathname] || pageConfig['/dashboard'];

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`${styles.mainContent} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <PageHeader 
          title={currentPage.title} 
          subtitle={currentPage.subtitle}
          onMenuClick={toggleSidebar}
        />
        {children}
      </main>
    </div>
  );
}
