import Image from 'next/image';
import styles from './FullPageLoader.module.css';

/**
 * FullPageLoader — Premium branded full-page loading overlay.
 *
 * @param {Object}  props
 * @param {string}  [props.message]  Optional status text (e.g. "Loading your dashboard…")
 * @param {boolean} [props.visible]  Controls visibility; defaults to true
 */
export default function FullPageLoader({ message = 'Loading…', visible = true }) {
  return (
    <div
      className={`${styles.overlay} ${!visible ? styles.overlayHidden : ''}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Logo mark with orbiting spinner */}
      <div className={styles.logoContainer}>
        <div className={styles.logoMark} aria-hidden="true">
          <Image src="/favicon.png" alt="" width={36} height={36} priority />
        </div>
        <div className={styles.spinnerRing} aria-hidden="true" />
      </div>

      {/* Status message */}
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
