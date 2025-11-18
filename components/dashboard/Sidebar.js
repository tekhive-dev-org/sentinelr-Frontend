import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('');

  // Update active menu based on current route
  useEffect(() => {
    const path = router.pathname;
    if (path === '/dashboard') {
      setActiveMenu('dashboard');
    } else if (path.startsWith('/dashboard/users')) {
      setActiveMenu('users');
    } else if (path.startsWith('/dashboard/alerts')) {
      setActiveMenu('alerts');
    } else if (path.startsWith('/dashboard/content')) {
      setActiveMenu('content');
    } else if (path.startsWith('/dashboard/subscription')) {
      setActiveMenu('subscription');
    } else if (path.startsWith('/dashboard/analytics')) {
      setActiveMenu('analytics');
    } else if (path.startsWith('/dashboard/settings')) {
      setActiveMenu('settings');
    }
  }, [router.pathname]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      iconPath: '/assets/icons/layout-grid.png',
      path: '/dashboard'
    },
    {
      id: 'users',
      label: 'Users & Family Management',
      iconPath: '/assets/icons/user.png',
      path: '/dashboard/users'
    },
    {
      id: 'alerts',
      label: 'Alert & Report Handling',
      iconPath: '/assets/icons/megaphone.png',
      path: '/dashboard/alerts'
    },
    {
      id: 'content',
      label: 'Content Management',
      iconComponent: DescriptionOutlinedIcon,
      path: '/dashboard/content'
    },
    {
      id: 'subscription',
      label: 'Subscription Management',
      iconPath: '/assets/icons/bank-card.png',
      path: '/dashboard/subscription'
    },
    {
      id: 'analytics',
      label: 'Analytics Management',
      iconPath: '/assets/icons/line-chart.png',
      path: '/dashboard/analytics'
    },
    {
      id: 'settings',
      label: 'Settings',
      iconPath: '/assets/icons/settings.png',
      path: '/dashboard/settings'
    }
  ];

  const handleMenuClick = (item) => {
    setActiveMenu(item.id);
    router.push(item.path);
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarContent}>
        

        <nav className={styles.navigation}>
          {menuItems.map((item) => {
            const IconComponent = item.iconComponent;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <span className={styles.menuIcon}>
                  {item.iconPath ? (
                    <Image 
                      src={item.iconPath} 
                      alt={item.label}
                      width={20}
                      height={20}
                    />
                  ) : IconComponent ? (
                    <IconComponent style={{ fontSize: 20 }} />
                  ) : null}
                </span>
                <span className={styles.menuLabel}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.profileAvatar}>LM</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>Chidi British</div>
            <div className={styles.profileEmail}>Admin@XYZ.com</div>
          </div>
          <ChevronRightIcon className={styles.profileArrow} />
        </div>
      </div>
    </aside>
  );
}
