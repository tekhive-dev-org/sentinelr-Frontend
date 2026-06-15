import styles from './ChartSkeleton.module.css';
import anim from './LoaderAnimations.module.css';

const BAR_HEIGHTS = ['barH1', 'barH2', 'barH3', 'barH4', 'barH5', 'barH6', 'barH7'];

/**
 * ChartSkeleton — Skeleton loader for chart / analytics views.
 *
 * @param {Object}  props
 * @param {'bar'|'line'} [props.variant='bar']  Chart type
 * @param {string}       [props.height='200px'] Chart area height
 * @param {number}       [props.bars=5]         Number of bars (bar variant only)
 * @param {string}       [props.className]      Additional class name
 */
export default function ChartSkeleton({ variant = 'bar', height = '200px', bars = 5, className = '' }) {
  return (
    <div className={`${styles.container} ${className}`} role="status" aria-label="Loading chart">
      <span className="sr-only">Loading…</span>

      {/* Title shimmer */}
      <div className={`${anim.shimmerBlock} ${styles.titleLine}`} />

      {/* Chart area */}
      <div className={styles.chartArea} style={{ height }}>
        {/* Y-axis labels */}
        <div className={styles.yAxis}>
          {[0, 1, 2, 3].map((i) => (
            <div key={`y-${i}`} className={`${anim.shimmerBlock} ${styles.yLabel}`} />
          ))}
        </div>

        {variant === 'bar' ? (
          /* ── Bar chart ──────────────────────────────────────────── */
          <div className={styles.barsContainer}>
            {Array.from({ length: bars }, (_, i) => (
              <div key={i} className={styles.barWrapper}>
                <div
                  className={`${anim.shimmerBlock} ${styles.bar} ${styles[BAR_HEIGHTS[i % BAR_HEIGHTS.length]]}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
                <div className={`${anim.shimmerBlock} ${styles.xLabel}`} />
              </div>
            ))}
          </div>
        ) : (
          /* ── Line chart ─────────────────────────────────────────── */
          <div className={styles.lineChartArea}>
            <div className={styles.linePath}>
              <svg className={styles.linePathSvg} viewBox="0 0 400 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className={styles.lineArea}
                  d="M0,180 C50,150 80,60 140,90 C200,120 220,40 280,70 C340,100 370,30 400,50 L400,200 L0,200 Z"
                />
                <path
                  className={styles.lineStroke}
                  d="M0,180 C50,150 80,60 140,90 C200,120 220,40 280,70 C340,100 370,30 400,50"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* X-axis labels (line variant) */}
      {variant === 'line' && (
        <div className={styles.xAxisRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={`x-${i}`} className={`${anim.shimmerBlock} ${styles.xLabel}`} />
          ))}
        </div>
      )}
    </div>
  );
}
