import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import styles from "./SettingsHistory.module.css";
import { formatDate } from "../../utils/settingsAdapters";

export default function SettingsHistory({
  history = null,
  isLoading = false,
}) {
  const entries = history || [];

  return (
    <section aria-labelledby="settings-history-title">
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">
          <HistoryOutlinedIcon fontSize="inherit" />
        </span>
        <div>
          <h2 id="settings-history-title" className={styles.title}>
            Change History
          </h2>
          <p className={styles.subtitle}>
            Audit trail of all setting modifications
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.timeline}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonEntry}>
              <div className={styles.skeletonDot} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <HistoryOutlinedIcon className={styles.emptyIcon} />
          <p>No change history for this setting</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {entries.map((entry, idx) => (
            <div key={entry.id || idx} className={styles.entry}>
              <div className={styles.entryDot} aria-hidden="true" />
              {idx < entries.length - 1 ? (
                <div className={styles.entryLine} aria-hidden="true" />
              ) : null}
              <div className={styles.entryContent}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryField}>
                    {entry.field || entry.key || "—"}
                  </span>
                  <span className={styles.entryTime}>
                    {entry.timestamp
                      ? formatDate(entry.timestamp)
                      : "—"}
                  </span>
                </div>

                <div className={styles.entryChange}>
                  <span className={styles.oldValue}>
                    {entry.oldValue != null ? String(entry.oldValue) : "—"}
                  </span>
                  <ArrowForwardOutlinedIcon
                    className={styles.arrowIcon}
                    fontSize="inherit"
                  />
                  <span className={styles.newValue}>
                    {entry.newValue != null ? String(entry.newValue) : "—"}
                  </span>
                </div>

                <div className={styles.entryMeta}>
                  {entry.editor ? (
                    <span>
                      Changed by <strong>{entry.editor}</strong>
                    </span>
                  ) : null}
                  {entry.reason ? (
                    <span className={styles.entryReason}>
                      &ldquo;{entry.reason}&rdquo;
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
