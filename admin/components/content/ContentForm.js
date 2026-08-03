import SaveIcon from "@mui/icons-material/Save";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PublishIcon from "@mui/icons-material/Publish";
import { CONTENT_TYPES, AUDIENCES } from "../../utils/contentAdapters";
import styles from "./ContentForm.module.css";

const STATUS_DOT_MAP = {
  draft: styles.statusDotDraft,
  scheduled: styles.statusDotScheduled,
  published: styles.statusDotPublished,
  archived: styles.statusDotArchived,
  expired: styles.statusDotExpired,
};

export default function ContentForm({
  item,
  onSave,
  onPublish,
  onSchedule,
  isSaving = false,
}) {
  const status = item?.status || "draft";

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="content-title" className={styles.label}>
          Title
        </label>
        <input
          id="content-title"
          type="text"
          className={styles.input}
          placeholder="Enter content title"
          defaultValue={item?.title || ""}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="content-type" className={styles.label}>
          Type
        </label>
        <select
          id="content-type"
          className={styles.select}
          defaultValue={item?.type || "help"}
        >
          {CONTENT_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="content-audience" className={styles.label}>
          Audience
        </label>
        <select
          id="content-audience"
          className={styles.select}
          defaultValue={item?.audience || "all"}
        >
          {AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {a === "all" ? "All users" : a.charAt(0).toUpperCase() + a.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="content-body" className={styles.label}>
          Body
        </label>
        <textarea
          id="content-body"
          className={styles.textarea}
          placeholder="Enter content body…"
          defaultValue={item?.raw?.body || ""}
          rows={8}
          required
        />
        <p className={styles.hint}>
          Structured content only &mdash; HTML not supported.
        </p>
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Status</span>
        <span className={styles.statusDisplay}>
          <span
            className={`${styles.statusDot} ${STATUS_DOT_MAP[status] || styles.statusDotDraft}`}
          />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.buttonDraft}
          onClick={() => onSave?.()}
          disabled={isSaving}
        >
          <SaveIcon className={styles.buttonIcon} />
          {isSaving ? "Saving…" : "Save Draft"}
        </button>

        <button
          type="button"
          className={styles.buttonSchedule}
          onClick={() => onSchedule?.()}
          disabled={isSaving}
        >
          <ScheduleIcon className={styles.buttonIcon} />
          Schedule
        </button>

        <button
          type="button"
          className={styles.buttonPublish}
          onClick={() => onPublish?.()}
          disabled={isSaving}
        >
          <PublishIcon className={styles.buttonIcon} />
          Publish
        </button>
      </div>
    </div>
  );
}
