import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import styles from "./ContentMobileCards.module.css";

const STATUS_COLORS = {
  draft: styles.statusDraft,
  scheduled: styles.statusScheduled,
  published: styles.statusPublished,
  archived: styles.statusArchived,
  expired: styles.statusExpired,
};

export default function ContentMobileCards({ items = [], onItemClick }) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={styles.card}
          onClick={() => onItemClick?.(item.id)}
        >
          <div className={styles.cardTop}>
            <div className={styles.pills}>
              <span className={styles.typePill}>{item.typeLabel}</span>
              <span
                className={`${styles.statusPill} ${STATUS_COLORS[item.status] || styles.statusDraft}`}
              >
                {item.status}
              </span>
            </div>
          </div>

          <p className={styles.title}>{item.title}</p>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <PeopleIcon className={styles.metaIcon} />
              {item.audienceLabel}
            </span>
            <span className={styles.metaItem}>
              <CalendarTodayIcon className={styles.metaIcon} />
              {item.updatedAt}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
