import Link from 'next/link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import styles from './AdminStatCard.module.css';

export default function AdminStatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  href,
  trend,
  isLoading = false,
  error = false,
  unavailable = false,
  onRetry,
}) {
  const showDashValue = error || unavailable;

  const cardContent = (
    <>
      {Icon ? (
        <div className={styles.iconBox} aria-hidden="true">
          <Icon className={styles.icon} />
        </div>
      ) : null}

      {isLoading ? (
        <>
          <div className={styles.valueSkeleton} aria-hidden="true" />
          <div className={styles.subtitleSkeleton} aria-hidden="true" />
        </>
      ) : (
        <>
          <p className={showDashValue ? styles.dashValue : styles.valueText}>
            {showDashValue ? '--' : value}
          </p>

          {label ? <p className={styles.label}>{label}</p> : null}

          {error ? (
            <div className={styles.errorSubtitle}>
              <span>Failed to load</span>
              {onRetry ? (
                <button
                  type="button"
                  className={styles.retryBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRetry();
                  }}
                  aria-label="Retry loading data"
                >
                  <RefreshIcon className={styles.retryIcon} />
                </button>
              ) : null}
            </div>
          ) : unavailable ? (
            <span className={styles.unavailableBadge}>
              <span className={styles.unavailableDot} aria-hidden="true" />
              Not connected
            </span>
          ) : (
            <>
              {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

              {trend ? (
                <div
                  className={trend.direction === 'up' ? styles.trendUp : styles.trendDown}
                  aria-label={`Trend ${trend.direction} by ${trend.value}`}
                >
                  {trend.direction === 'up' ? (
                    <ArrowUpwardIcon className={styles.trendIcon} fontSize="inherit" />
                  ) : (
                    <ArrowDownwardIcon className={styles.trendIcon} fontSize="inherit" />
                  )}
                  <span>{trend.value}</span>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </>
  );

  if (href && !isLoading) {
    return (
      <Link href={href} className={`${styles.card} ${styles.cardClickable}`}>
        {cardContent}
      </Link>
    );
  }

  return <div className={styles.card}>{cardContent}</div>;
}
