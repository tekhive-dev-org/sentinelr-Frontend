import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import styles from "./NotificationMobileCards.module.css";

const CHANNEL_COLORS = {
  in_app: styles.channelInApp,
  push: styles.channelPush,
  email: styles.channelEmail,
};

const STATUS_COLORS = {
  draft: styles.statusDraft,
  scheduled: styles.statusScheduled,
  sent: styles.statusSent,
  failed: styles.statusFailed,
};

export default function NotificationMobileCards({ campaigns = [], onItemClick }) {
  if (!campaigns.length) return null;

  return (
    <div className="space-y-3">
      {campaigns.map((c) => (
        <button
          key={c.id}
          type="button"
          className={styles.card}
          onClick={() => onItemClick?.(c.id)}
        >
          <div className={styles.cardTop}>
            <div className={styles.pills}>
              <span
                className={`${styles.channelPill} ${CHANNEL_COLORS[c.channel] || styles.channelInApp}`}
              >
                {c.channelLabel}
              </span>
              <span
                className={`${styles.statusPill} ${STATUS_COLORS[c.status] || styles.statusDraft}`}
              >
                {c.statusLabel || c.status}
              </span>
            </div>
          </div>

          <p className={styles.title}>{c.title}</p>

          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <PeopleIcon className={styles.metaIcon} />
                {c.audienceLabel}
              </span>
              <span className={styles.metaItem}>
                <CalendarTodayIcon className={styles.metaIcon} />
                {c.scheduledAt || c.sentAt || c.createdAt}
              </span>
            </div>
            <div className={styles.deliveryStats}>
              <span className={styles.deliverySent}>{c.sentCount} sent</span>
              <span className={styles.deliveryDelivered}>{c.deliveredCount} delivered</span>
              {c.failedCount > 0 ? (
                <span className={styles.deliveryFailed}>{c.failedCount} failed</span>
              ) : null}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
