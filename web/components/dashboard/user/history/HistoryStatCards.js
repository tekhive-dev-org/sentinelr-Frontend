/**
 * HistoryStatCards
 * Renders the row of glassmorphic stat cards: Distance Covered, Stops, Alerts × 2.
 */

import React, { useState, useRef, useEffect } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from './HistoryReports.module.css';

const STATS_CONFIG = [
  {
    key: 'distance',
    title: 'Distance Covered',
    icon: DirectionsCarIcon,
    colorClass: 'iconGreen',
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'stops',
    title: 'Stops',
    icon: LocationOnIcon,
    colorClass: 'iconBlue',
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'alerts',
    title: 'Alerts',
    icon: WarningAmberIcon,
    colorClass: 'iconRed',
    format: (v) => v.toLocaleString(),
  },
  {
    key: 'notifications',
    title: 'Alerts',
    icon: NotificationsActiveIcon,
    colorClass: 'iconOrange',
    format: (v) => v.toLocaleString(),
  },
];

export default function HistoryStatCards({ stats = {} }) {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.statsGrid}>
      {STATS_CONFIG.map((cfg) => {
        const Icon = cfg.icon;
        const value = stats[cfg.key] ?? 0;

        return (
          <div key={cfg.key} className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statLabel}>
                <div className={`${styles.statIconWrap} ${styles[cfg.colorClass]}`}>
                  <Icon />
                </div>
                <span className={styles.statTitle}>{cfg.title}</span>
              </div>
              <div ref={openMenu === cfg.key ? menuRef : null} className={styles.menuWrapper}>
                <button
                  className={styles.menuBtn}
                  onClick={() => setOpenMenu(openMenu === cfg.key ? null : cfg.key)}
                  aria-label={`${cfg.title} options`}
                >
                  <MoreVertIcon style={{ fontSize: 18 }} />
                </button>
                {openMenu === cfg.key && (
                  <div className={styles.dropdownMenu}>
                    <button className={styles.dropdownItem} onClick={() => setOpenMenu(null)}>
                      View details
                    </button>
                    <button className={styles.dropdownItem} onClick={() => setOpenMenu(null)}>
                      Export data
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.statValue}>{cfg.format(value)}</div>
          </div>
        );
      })}
    </div>
  );
}
