/**
 * ComingSoon
 * Full-page "Coming Soon" placeholder used inside DashboardLayout
 * for pages that haven't been built yet.
 */

import React from 'react';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import styles from './ComingSoon.module.css';

export default function ComingSoon({
  title = 'Coming Soon',
  description = 'This feature is currently under development and will be available shortly.',
  icon: Icon = RocketLaunchIcon,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <Icon className={styles.icon} />
        </div>
        <span className={styles.badge}>Coming Soon</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    </div>
  );
}
