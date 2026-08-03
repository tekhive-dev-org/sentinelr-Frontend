import { useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SendIcon from "@mui/icons-material/Send";
import ApprovalIcon from "@mui/icons-material/Approval";
import { AUDIENCES } from "../../utils/contentAdapters";
import styles from "./CampaignForm.module.css";

const CHANNEL_OPTIONS = [
  { value: "in_app", label: "In-App" },
  { value: "push", label: "Push" },
  { value: "email", label: "Email" },
];

export default function CampaignForm({
  campaign,
  onSave,
  onSchedule,
  onSend,
  onRequestApproval,
  isSaving = false,
}) {
  const [hasSchedule, setHasSchedule] = useState(Boolean(campaign?.scheduledAt));
  const [sendToAll, setSendToAll] = useState(false);

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="campaign-title" className={styles.label}>
          Title
        </label>
        <input
          id="campaign-title"
          type="text"
          className={styles.input}
          placeholder="Enter campaign title"
          defaultValue={campaign?.title || ""}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="campaign-channel" className={styles.label}>
          Channel
        </label>
        <select
          id="campaign-channel"
          className={styles.select}
          defaultValue={campaign?.channel || "in_app"}
        >
          {CHANNEL_OPTIONS.map((ch) => (
            <option key={ch.value} value={ch.value}>
              {ch.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="campaign-audience" className={styles.label}>
          Audience
        </label>
        <select
          id="campaign-audience"
          className={styles.select}
          defaultValue={campaign?.audience || "all"}
        >
          {AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {a === "all" ? "All users" : a.charAt(0).toUpperCase() + a.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="campaign-body" className={styles.label}>
          Message body
        </label>
        <textarea
          id="campaign-body"
          className={styles.textarea}
          placeholder="Type your notification message…"
          defaultValue={campaign?.raw?.body || ""}
          rows={6}
          required
        />
      </div>

      {/* Schedule toggle */}
      <div className={styles.field}>
        <div className={styles.toggleRow}>
          <input
            id="campaign-schedule-toggle"
            type="checkbox"
            className={styles.checkbox}
            checked={hasSchedule}
            onChange={(e) => setHasSchedule(e.target.checked)}
          />
          <label htmlFor="campaign-schedule-toggle" className={styles.toggleLabel}>
            Schedule for later
          </label>
        </div>

        {hasSchedule ? (
          <input
            type="datetime-local"
            className={styles.datetimeInput}
            defaultValue={campaign?.scheduledAt || ""}
            aria-label="Schedule date and time"
          />
        ) : null}
      </div>

      {/* Send to all users */}
      <div className={styles.field}>
        <div className={styles.toggleRow}>
          <input
            id="campaign-all-users"
            type="checkbox"
            className={styles.checkbox}
            checked={sendToAll}
            onChange={(e) => setSendToAll(e.target.checked)}
          />
          <label htmlFor="campaign-all-users" className={styles.toggleLabel}>
            Send to all users
          </label>
        </div>

        {sendToAll ? (
          <div className={styles.warningBox}>
            <p className={styles.warningText}>
              <span className={styles.warningTitle}>Warning:</span> This will send the
              notification to every registered user. This action cannot be undone.
              Double-check your message before proceeding.
            </p>
          </div>
        ) : null}
      </div>

      {/* Actions */}
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
          className={styles.buttonApproval}
          onClick={() => onRequestApproval?.()}
          disabled={isSaving}
        >
          <ApprovalIcon className={styles.buttonIcon} />
          Request Approval
        </button>

        <button
          type="button"
          className={styles.buttonSend}
          onClick={() => onSend?.()}
          disabled={isSaving}
        >
          <SendIcon className={styles.buttonIcon} />
          Send
        </button>
      </div>
    </div>
  );
}
