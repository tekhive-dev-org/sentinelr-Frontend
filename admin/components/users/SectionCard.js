import styles from './SectionCard.module.css';

const EMPTY_FALLBACK = 'No data available.';

export default function SectionCard({
  title,
  icon: Icon,
  children,
  isLoading,
  isEmpty,
  emptyText,
}) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        {Icon && <Icon className={styles.headerIcon} aria-hidden="true" />}
        <h3 className={styles.headerTitle}>{title}</h3>
      </header>

      <div className={styles.body}>
        {isLoading ? (
          <div className={styles.skeletonGroup} aria-busy="true">
            <span className={styles.skeletonLine} />
            <span className={styles.skeletonLine + ' ' + styles.skeletonLineShort} />
            <span className={styles.skeletonLine} />
          </div>
        ) : isEmpty ? (
          <p className={styles.empty}>{emptyText || EMPTY_FALLBACK}</p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
