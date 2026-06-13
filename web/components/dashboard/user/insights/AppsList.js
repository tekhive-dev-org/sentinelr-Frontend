import Image from 'next/image';
import styles from './AppsList.module.css';
import { CardSkeleton } from '../../../ui/loaders';

/** Parse "3h 45m", "2h 15m" etc. into total minutes for relative bar widths. */
function parseMinutes(timeStr) {
  if (!timeStr) return 0;
  const h = timeStr.match(/(\d+)h/);
  const m = timeStr.match(/(\d+)m/);
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
}

export default function AppsList({ apps, loading }) {
  const maxMinutes = apps?.length
    ? Math.max(...apps.map((a) => parseMinutes(a.time)), 1)
    : 1;

  return (
    <div className={styles.container}>
      <div className={styles.headingRow}>
        <div>
          <h3 className={styles.heading}>Most Used Apps</h3>
          <p className={styles.subtext}>Screen time breakdown by application.</p>
        </div>
      </div>

      <div className={styles.list}>
        {loading ? (
          <CardSkeleton variant="compact" count={4} />
        ) : (
          apps?.map((app, index) => {
            const pct = Math.round((parseMinutes(app.time) / maxMinutes) * 100);
            return (
              <div key={app.id} className={styles.appItem}>
                {/* Rank */}
                <span className={styles.rank}>{index + 1}</span>

                {/* Icon */}
                <div className={styles.iconWrap}>
                  <Image
                    src={app.icon}
                    alt={app.name}
                    width={40}
                    height={40}
                    className={styles.appIcon}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>

                {/* Name + subtitle */}
                <div className={styles.infoCol}>
                  <span className={styles.appName}>{app.name}</span>
                  <span className={styles.appSub}>{app.subval} videos</span>
                </div>

                {/* Time + usage bar */}
                <div className={styles.timeCol}>
                  <span className={styles.timeLabel}>{app.time}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${pct}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

