import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import styles from "./UnauthorizedState.module.css";

export default function UnauthorizedState({
  title = "You do not have access to this area",
  message = "Your account does not have the permission required to view this admin page.",
  actionLabel = "Return to dashboard",
  onAction,
  onRetry,
  isRetrying = false,
}) {
  return (
    <main className={styles.page} aria-labelledby="admin-unauthorized-title">
      <section className={styles.card} role="alert">
        <span className={styles.iconWrap} aria-hidden="true">
          <LockOutlinedIcon className={styles.icon} />
        </span>
        <p className={styles.eyebrow}>Access restricted</p>
        <h1 id="admin-unauthorized-title" className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          {onRetry ? (
            <button type="button" className={styles.secondaryButton} onClick={onRetry} disabled={isRetrying}>
              <RefreshOutlinedIcon className={styles.buttonIcon} />
              {isRetrying ? "Checking access…" : "Retry verification"}
            </button>
          ) : null}
          {onAction ? (
            <button type="button" className={styles.primaryButton} onClick={onAction}>
              {actionLabel}
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
