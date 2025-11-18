import { useState } from 'react';
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

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={styles.mainContent}>
        <PageHeader title={currentPage.title} subtitle={currentPage.subtitle} />
        {children}
      </main>
    </div>
  );
}
