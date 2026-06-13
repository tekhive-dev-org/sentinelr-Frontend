import FullPageLoader from './loaders/FullPageLoader';
import styles from './LoadingSpinner.module.css';

/**
 * LoadingSpinner — Backward-compatible loading indicator.
 *
 * - fullScreen=true  → renders the premium FullPageLoader overlay
 * - fullScreen=false → renders a lightweight inline spinner
 *
 * @param {Object}  props
 * @param {boolean} [props.fullScreen=false]  Use full-page branded loader
 * @param {string}  [props.message]           Optional status text (fullScreen only)
 */
export default function LoadingSpinner({ fullScreen = false, message }) {
  if (fullScreen) {
    return <FullPageLoader message={message || 'Loading…'} />;
  }

  return (
    <div className={styles.container} role="status" aria-label="Loading">
      <div className={styles.spinner} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
