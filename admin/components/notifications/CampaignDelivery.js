import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./CampaignDelivery.module.css";

function Skeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.skeleton}>
        <div className={`${styles.skeletonLine} w-32`} />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 p-4">
              <div className={`${styles.skeletonLine} w-16`} />
              <div className={`${styles.skeletonLine} w-12`} />
            </div>
          ))}
        </div>
        <div className={styles.skeletonBar} />
        <div className={styles.skeletonBar} />
        <div className={`${styles.skeletonLine} w-48`} />
      </div>
    </div>
  );
}

export default function CampaignDelivery({ delivery, isLoading = false }) {
  if (isLoading) {
    return <Skeleton />;
  }

  if (!delivery) {
    return (
      <div className={styles.wrap}>
        <p className={styles.heading}>Delivery statistics</p>
        <p className="mt-3 text-sm text-slate-400">
          No delivery data available yet.
        </p>
      </div>
    );
  }

  const {
    sentCount = 0,
    deliveredCount = 0,
    failedCount = 0,
    openedCount = 0,
    failures = [],
  } = delivery;

  const deliveredPct =
    sentCount > 0 ? Math.round((deliveredCount / sentCount) * 100) : 0;
  const openedPct =
    sentCount > 0 ? Math.round((openedCount / sentCount) * 100) : 0;
  const failedPct =
    sentCount > 0 ? Math.round((failedCount / sentCount) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <p className={styles.heading}>Delivery statistics</p>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Sent</p>
          <p className={`${styles.statValue} ${styles.statSent}`}>
            {sentCount.toLocaleString()}
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Delivered</p>
          <p className={`${styles.statValue} ${styles.statDelivered}`}>
            {deliveredCount.toLocaleString()}
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Failed</p>
          <p className={`${styles.statValue} ${styles.statFailed}`}>
            {failedCount.toLocaleString()}
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Opened</p>
          <p className={`${styles.statValue} ${styles.statOpened}`}>
            {openedCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress bars */}
      <div className={styles.bars}>
        <div className={styles.barRow}>
          <span className={styles.barLabel}>
            <span className={styles.barLabelName}>Delivered</span>
            <span>{deliveredPct}%</span>
          </span>
          <div className={styles.barTrack}>
            <div
              className={`${styles.barFill} ${styles.barDelivered}`}
              style={{ width: `${deliveredPct}%` }}
            />
          </div>
        </div>

        <div className={styles.barRow}>
          <span className={styles.barLabel}>
            <span className={styles.barLabelName}>Opened</span>
            <span>{openedPct}%</span>
          </span>
          <div className={styles.barTrack}>
            <div
              className={`${styles.barFill} ${styles.barOpened}`}
              style={{ width: `${openedPct}%` }}
            />
          </div>
        </div>

        {failedCount > 0 ? (
          <div className={styles.barRow}>
            <span className={styles.barLabel}>
              <span className={styles.barLabelName}>Failed</span>
              <span>{failedPct}%</span>
            </span>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${styles.barFailed}`}
                style={{ width: `${failedPct}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Failure list */}
      {failures.length > 0 ? (
        <div className={styles.failureSection}>
          <p className={styles.failureHeading}>
            Failure details ({failures.length})
          </p>
          <div className={styles.failureList}>
            {failures.map((f, idx) => (
              <div key={idx} className={styles.failureItem}>
                <ErrorOutlineIcon className={styles.failureIcon} />
                <span className={styles.failureReason}>
                  {f.reason || "Unknown error"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Note */}
      <p className={styles.note}>
        Delivery status confirmed by backend only.
      </p>
    </div>
  );
}
