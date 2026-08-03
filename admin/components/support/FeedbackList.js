import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import styles from './FeedbackList.module.css';

function StarRating({ rating }) {
  const total = 5;
  const filled = Math.min(Math.max(Math.round(rating || 0), 0), total);

  return (
    <span className={styles.starRating} aria-label={`${filled} out of ${total} stars`}>
      {Array.from({ length: total }).map((_, i) =>
        i < filled ? (
          <StarIcon key={i} className={styles.starFilled} />
        ) : (
          <StarBorderIcon key={i} className={styles.starEmpty} />
        ),
      )}
    </span>
  );
}

function SkeletonItem() {
  return (
    <div className={styles.item}>
      <div className={styles.itemContent}>
        <div className={styles.skeleton} style={{ width: 100, height: 16, marginBottom: 6 }} />
        <div className={styles.skeleton} style={{ width: 140, height: 12, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 200, height: 12, marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ width: 80, height: 12 }} />
      </div>
    </div>
  );
}

export default function FeedbackList({ items, isLoading, error }) {
  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.errorBanner} role="alert">
          <ErrorOutlineIcon className={styles.errorIcon} />
          <span className={styles.errorText}>{error}</span>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            <ReplayIcon className={styles.retryIcon} />
            Retry
          </button>
        </div>
      )}

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={`skel-fb-${i}`} />)}

      {!isLoading && !error && items.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No feedback yet</p>
          <p className={styles.emptyDesc}>
            Feedback from users will appear here.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        items.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemContent}>
              <div className={styles.itemHeader}>
                <span className={styles.userName}>{item.user || 'Anonymous'}</span>
                <StarRating rating={item.rating} />
              </div>
              <p className={styles.comment}>{item.comment || 'No comment'}</p>
              <div className={styles.itemMeta}>
                {item.category && (
                  <span className={styles.categoryTag}>{item.category}</span>
                )}
                <span className={styles.dateText}>
                  {item.date
                    ? new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
