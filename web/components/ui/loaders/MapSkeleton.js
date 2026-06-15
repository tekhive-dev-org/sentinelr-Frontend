import styles from './MapSkeleton.module.css';
import anim from './LoaderAnimations.module.css';

/**
 * MapSkeleton — Skeleton loader for map / location views.
 *
 * @param {Object}  props
 * @param {string}  [props.height='380px']  Container height
 * @param {string}  [props.className]       Additional class name
 */
export default function MapSkeleton({ height = '380px', className = '' }) {
  return (
    <div
      className={`${styles.container} ${className}`}
      style={{ height }}
      role="status"
      aria-label="Loading map"
    >
      <span className="sr-only">Loading…</span>

      {/* Shimmer map background */}
      <div className={`${anim.shimmerBlock} ${styles.mapArea}`}>
        {/* Street grid overlay */}
        <div className={styles.gridOverlay} aria-hidden="true" />

        {/* Centered map pin */}
        <div className={styles.pinContainer} aria-hidden="true">
          <div className={styles.pinHead} />
          <div className={styles.pinStem} />
          <div className={styles.pinShadow} />
        </div>
      </div>

      {/* Coordinates card at bottom */}
      <div className={styles.coordsCard} aria-hidden="true">
        <div className={`${anim.shimmerBlock} ${styles.coordLine1}`} />
        <div className={`${anim.shimmerBlock} ${styles.coordLine2}`} />
      </div>
    </div>
  );
}
