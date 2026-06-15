import styles from './ButtonLoader.module.css';

/**
 * ButtonLoader — A button that shows a 3-dot loading animation
 * while preserving its original dimensions.
 *
 * @param {Object}   props
 * @param {boolean}  props.loading     Whether the button is in loading state
 * @param {React.ReactNode} props.children  Button label/content
 * @param {string}   [props.className]  Additional class name
 * @param {boolean}  [props.disabled]   Disabled state (also set when loading)
 * @param {Function} [props.onClick]    Click handler (ignored when loading)
 * @param {string}   [props.type]       Button type attribute
 */
export default function ButtonLoader({
  loading = false,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${loading ? styles.buttonLoading : ''} ${className}`}
      disabled={disabled || loading}
      onClick={!loading ? onClick : undefined}
      aria-busy={loading}
      {...rest}
    >
      {/* Original content — hidden but still takes up space when loading */}
      <span className={`${styles.content} ${loading ? styles.contentHidden : ''}`}>
        {children}
      </span>

      {/* Loading dots — positioned absolute over the content */}
      {loading && (
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
      )}
    </button>
  );
}
