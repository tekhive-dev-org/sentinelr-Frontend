import styles from './TableSkeleton.module.css';
import anim from './LoaderAnimations.module.css';

/**
 * TableSkeleton — Skeleton loader for tables and lists.
 *
 * @param {Object}  props
 * @param {number}  [props.rows=5]     Number of data rows to render
 * @param {number}  [props.columns=4]  Number of columns (2–6)
 * @param {string}  [props.className]  Additional class name
 */
export default function TableSkeleton({ rows = 5, columns = 4, className = '' }) {
  // Build column size pattern: first col wide, rest alternate medium/small
  const colSizes = Array.from({ length: columns }, (_, i) => {
    if (i === 0) return 'Wide';
    return i % 2 === 0 ? 'Small' : 'Medium';
  });

  return (
    <div
      className={`${styles.container} ${className}`}
      role="status"
      aria-label="Loading table"
    >
      <span className="sr-only">Loading…</span>

      {/* Header row */}
      <div className={styles.headerRow}>
        {colSizes.map((size, i) => (
          <div
            key={`h-${i}`}
            className={`${anim.shimmerBlock} ${styles[`headerCell${size}`]}`}
          />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }, (_, rowIdx) => (
        <div
          key={rowIdx}
          className={`${styles.dataRow} ${styles[`row${rowIdx}`] || ''}`}
        >
          {colSizes.map((size, colIdx) => (
            <div
              key={`d-${rowIdx}-${colIdx}`}
              className={`${anim.shimmerBlock} ${styles[`dataCell${size}`]}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
