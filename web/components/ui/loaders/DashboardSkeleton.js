import styles from './DashboardSkeleton.module.css';
import anim from './LoaderAnimations.module.css';
import CardSkeleton from './CardSkeleton';
import MapSkeleton from './MapSkeleton';
import ChartSkeleton from './ChartSkeleton';

/**
 * DashboardSkeleton — Full dashboard page skeleton matching
 * the UserDashboardOverview layout.
 */
export default function DashboardSkeleton() {
  return (
    <div className={styles.container} role="status" aria-label="Loading dashboard">
      <span className="sr-only">Loading…</span>

      {/* ── Map section ──────────────────────────────────────────── */}
      <div className={styles.mapSection}>
        <div className={styles.mapHeader}>
          <div className={`${anim.shimmerBlock} ${styles.mapTitleLine}`} />
          <div className={`${anim.shimmerBlock} ${styles.mapActionLine}`} />
        </div>
        <MapSkeleton height="340px" />
      </div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <CardSkeleton variant="stat" />
        <CardSkeleton variant="stat" />
        <CardSkeleton variant="stat" />
      </div>

      {/* ── Main content grid ────────────────────────────────────── */}
      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          {/* Charts row */}
          <div className={styles.chartsRow}>
            <ChartSkeleton variant="bar" height="180px" bars={5} />
            <ChartSkeleton variant="line" height="180px" />
          </div>

          {/* Screen time card */}
          <div className={styles.screenTimeCard}>
            <div className={`${anim.shimmerBlock} ${styles.screenTimeTitle}`} />
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.screenTimeRow}>
                <div className={`${anim.shimmerBlock} ${styles.screenTimeLabel}`} />
                <div className={`${anim.shimmerBlock} ${styles.screenTimeValue}`} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Activity card */}
          <div className={styles.activityCard}>
            <div className={`${anim.shimmerBlock} ${styles.activityTitle}`} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.activityItem}>
                <div className={`${anim.shimmerBlock} ${styles.activityDot}`} />
                <div className={styles.activityLines}>
                  <div className={`${anim.shimmerBlock} ${styles.activityLine1}`} />
                  <div className={`${anim.shimmerBlock} ${styles.activityLine2}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
