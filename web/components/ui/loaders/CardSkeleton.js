import styles from './CardSkeleton.module.css';
import anim from './LoaderAnimations.module.css';

/**
 * CardSkeleton — Reusable skeleton loader for stat/info cards.
 *
 * @param {Object}  props
 * @param {'stat'|'info'|'compact'} [props.variant='stat']  Visual variant
 * @param {number}  [props.count=1]  Number of skeleton cards to render
 * @param {string}  [props.className]  Additional class name for the grid wrapper
 */
export default function CardSkeleton({ variant = 'stat', count = 1, className = '' }) {
  const gridClass =
    count >= 3 ? styles.gridThree :
    count === 2 ? styles.gridTwo :
    styles.gridOne;

  const cards = Array.from({ length: count }, (_, i) => {
    const delayClass = anim[`delay${(i % 7) + 1}`] || '';

    if (variant === 'compact') {
      return (
        <div key={i} className={`${styles.compactCard} ${delayClass}`} aria-hidden="true">
          <div className={styles.compactRow}>
            <div className={`${anim.shimmerBlock} ${styles.compactIcon}`} />
            <div className={styles.compactLines}>
              <div className={`${anim.shimmerBlock} ${styles.compactLine1}`} />
              <div className={`${anim.shimmerBlock} ${styles.compactLine2}`} />
            </div>
          </div>
        </div>
      );
    }

    if (variant === 'info') {
      return (
        <div key={i} className={`${styles.card} ${delayClass}`} aria-hidden="true">
          <div className={styles.infoBody}>
            <div className={`${anim.shimmerBlock} ${styles.infoLine1}`} />
            <div className={`${anim.shimmerBlock} ${styles.infoLine2}`} />
            <div className={`${anim.shimmerBlock} ${styles.infoLine3}`} />
          </div>
        </div>
      );
    }

    // Default: stat variant
    return (
      <div key={i} className={`${styles.card} ${delayClass}`} aria-hidden="true">
        <div className={styles.statHeader}>
          <div className={`${anim.shimmerBlock} ${styles.iconPlaceholder}`} />
          <div className={`${anim.shimmerBlock} ${styles.titleLine}`} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className={`${anim.shimmerBlock} ${styles.valueLine}`} />
        </div>
      </div>
    );
  });

  if (count === 1) {
    return (
      <div role="status" aria-label="Loading card">
        <span className="sr-only">Loading…</span>
        {cards}
      </div>
    );
  }

  return (
    <div className={`${styles.grid} ${gridClass} ${className}`} role="status" aria-label="Loading cards">
      <span className="sr-only">Loading…</span>
      {cards}
    </div>
  );
}
