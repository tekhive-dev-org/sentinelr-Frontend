/**
 * BottomAppBar
 * Mobile-only fixed bottom navigation bar for the user dashboard.
 * Shows 5 primary nav items; hidden on desktop (≥769px).
 */

import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import FenceRoundedIcon from '@mui/icons-material/FenceRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import styles from './BottomAppBar.module.css';

const PRIMARY_ITEMS = [
  { id: 'dashboard', label: 'Home', path: '/dashboard', Icon: GridViewRoundedIcon },
  { id: 'devices',   label: 'Devices', path: '/dashboard/devices', Icon: DevicesRoundedIcon },
  { id: 'history',   label: 'History', path: '/dashboard/history', Icon: HistoryRoundedIcon },
  { id: 'alerts',    label: 'Alerts', path: '/dashboard/alerts', Icon: NotificationsRoundedIcon },
];

const MORE_ITEMS = [
  { id: 'parental',     label: 'Parental Control', path: '/dashboard/parental', Icon: AdminPanelSettingsRoundedIcon },
  { id: 'geofencing',   label: 'Geofencing', path: '/dashboard/geofencing', Icon: FenceRoundedIcon },
  { id: 'insights',     label: 'Usage Insights', path: '/dashboard/insights', Icon: InsightsRoundedIcon },
  { id: 'subscription', label: 'Subscription', path: '/dashboard/subscription', Icon: CreditCardRoundedIcon },
  { id: 'settings',     label: 'Settings', path: '/dashboard/settings', Icon: SettingsRoundedIcon },
];

function getActiveId(pathname) {
  if (pathname === '/dashboard') return 'dashboard';
  const segment = pathname.replace('/dashboard/', '').split('/')[0];
  return segment || 'dashboard';
}

export default function BottomAppBar() {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const activeId = useMemo(() => getActiveId(router.pathname), [router.pathname]);

  // Check if the active item is in the "more" menu
  const isMoreActive = MORE_ITEMS.some((item) => item.id === activeId);

  const handleNav = (path) => {
    setShowMore(false);
    router.push(path);
  };

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className={styles.moreOverlay} onClick={() => setShowMore(false)}>
          <div className={styles.moreSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.moreHeader}>
              <span className={styles.moreTitle}>More</span>
              <button className={styles.moreClose} onClick={() => setShowMore(false)}>
                <CloseRoundedIcon style={{ fontSize: 20 }} />
              </button>
            </div>
            <nav className={styles.moreGrid}>
              {MORE_ITEMS.map(({ id, label, path, Icon }) => (
                <button
                  key={id}
                  className={`${styles.moreItem} ${activeId === id ? styles.moreItemActive : ''}`}
                  onClick={() => handleNav(path)}
                >
                  <Icon className={styles.moreItemIcon} />
                  <span className={styles.moreItemLabel}>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className={styles.bar}>
        {PRIMARY_ITEMS.map(({ id, label, path, Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${activeId === id ? styles.tabActive : ''}`}
            onClick={() => handleNav(path)}
          >
            <Icon className={styles.tabIcon} />
            <span className={styles.tabLabel}>{label}</span>
          </button>
        ))}
        <button
          className={`${styles.tab} ${showMore || isMoreActive ? styles.tabActive : ''}`}
          onClick={() => setShowMore((v) => !v)}
        >
          <MoreHorizRoundedIcon className={styles.tabIcon} />
          <span className={styles.tabLabel}>More</span>
        </button>
      </nav>
    </>
  );
}
