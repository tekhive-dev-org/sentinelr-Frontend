import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from './Sidebar.module.css';
import { useAuth } from '../../context/AuthContext';
import LogoutModal from './LogoutModal';

export default function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter();
  const { user, logout, loggedUser } = useAuth();
  const [activeMenu, setActiveMenu] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // console.log(loggedUser);


// Close menu when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(`.${styles.userSection}`)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

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
    } else if (path.startsWith('/dashboard/devices')) {
      setActiveMenu('devices');
    } else if (path.startsWith('/dashboard/history')) {
      setActiveMenu('history');
    } else if (path.startsWith('/dashboard/parental')) {
      setActiveMenu('parental');
    } else if (path.startsWith('/dashboard/geofencing')) {
      setActiveMenu('geofencing');
    } else if (path.startsWith('/dashboard/insights')) {
      setActiveMenu('insights');
    }
  }, [router.pathname]);

  const adminMenuItems = [
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

  const userMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      iconPath: '/assets/icons/layout-grid.png',
      path: '/dashboard'
    },
    {
      id: 'devices',
      label: 'Devices & Users',
      iconPath: '/assets/icons/user.png',
      path: '/dashboard/devices'
    },
    {
      id: 'alerts',
      label: 'Sos Alert',
      iconPath: '/assets/icons/megaphone.png',
      path: '/dashboard/alerts'
    },
    {
      id: 'history',
      label: 'History & Reports',
      iconPath: '/assets/icons/bill-line.png',
      path: '/dashboard/history'
    },
    {
      id: 'parental',
      label: 'Parental Control',
      iconPath: '/assets/icons/check.png',
      path: '/dashboard/parental'
    },
    {
      id: 'geofencing',
      label: 'Geofencing',
      iconPath: '/assets/icons/layout-grid.png', // Reusing layout-grid for now
      path: '/dashboard/geofencing'
    },
    {
      id: 'insights',
      label: 'Usage Insights',
      iconPath: '/assets/icons/line-chart.png',
      path: '/dashboard/insights'
    },
    {
      id: 'subscription',
      label: 'Subscription',
      iconPath: '/assets/icons/bank-card.png',
      path: '/dashboard/subscription'
    },
    {
      id: 'settings',
      label: 'Settings',
      iconPath: '/assets/icons/settings.png',
      path: '/dashboard/settings'
    }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;

  const handleMenuClick = (item) => {
    setActiveMenu(item.id);
    router.push(item.path);
  };

  const handleLogout = () => {
      logout();
      router.push('/login');
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

        <div className={styles.userSection}>
            {showUserMenu && (
              <div className={styles.userMenu}>
                <button className={styles.userMenuItem} onClick={() => {
                    setShowUserMenu(false);
                    router.push('/dashboard/settings');
                }}>
                  <span className={styles.menuIcon}>
                    <img src="/assets/icons/settings.png" alt="Settings" width={20} height={20} style={{ opacity: 0.6 }} /> 
                  </span>
                  My Profile
                </button>
                <div className={styles.menuDivider} />
                <button className={`${styles.userMenuItem} ${styles.danger}`} onClick={() => {
                    setShowUserMenu(false);
                    setIsLogoutModalOpen(true);
                }}>
                  <span className={styles.menuIcon}>
                    <LogoutOutlinedIcon style={{ fontSize: 20 }} />
                  </span>
                  Logout
                </button>
              </div>
            )}

            <div className={styles.userProfile} onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className={styles.profileAvatar}>LM</div>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{loggedUser?.userName || 'User'}</div>
                <div className={styles.profileEmail}>{loggedUser?.email || 'user@xyz.com'}</div>
              </div>
              <ChevronRightIcon 
                className={styles.profileArrow} 
                style={{ transform: showUserMenu ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              />
            </div>
        </div>

      </div>
      
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogout} 
      />
    </aside>
  );
}
