import styles from "./FullPageLoader.module.css";

export default function FullPageLoader({ message = "Loading…" }) {
  return (
    <main className={styles.page} role="status" aria-live="polite">
      <section className={styles.card}>
        <div className={styles.spinner} aria-hidden="true" />
        <h1 className={styles.title}>Sentinelr Admin</h1>
        <p className={styles.message}>{message}</p>
      </section>
    </main>
  );
}
