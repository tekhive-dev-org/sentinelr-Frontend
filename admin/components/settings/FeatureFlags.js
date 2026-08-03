import { useState, useCallback } from "react";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import styles from "./FeatureFlags.module.css";

function FlagCard({ flag, onToggle, isToggling, canManage }) {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  const isActive = Boolean(flag.value);

  const handleToggleRequest = () => {
    if (!canManage) return;
    setReason("");
    setShowReason(true);
  };

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onToggle(flag.key, !isActive, reason.trim());
    setShowReason(false);
    setReason("");
  };

  const handleCancel = () => {
    setShowReason(false);
    setReason("");
  };

  return (
    <div
      className={`${styles.flagCard} ${isActive ? styles.flagActive : ""}`}
    >
      <div className={styles.flagHeader}>
        <div className={styles.flagInfo}>
          <h3 className={styles.flagName}>{flag.label || flag.key}</h3>
          {flag.description ? (
            <p className={styles.flagDescription}>{flag.description}</p>
          ) : null}
        </div>

        <div className={styles.flagStatus}>
          <span
            className={`${styles.statusDot} ${
              isActive ? styles.statusDotActive : ""
            }`}
            aria-hidden="true"
          />
          <span className={styles.statusText}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {!canManage ? (
        <div className={styles.restrictedRow}>
          <LockOutlinedIcon className={styles.lockIcon} />
          <span>Permission required to toggle</span>
        </div>
      ) : showReason ? (
        <div className={styles.reasonBox}>
          <div className={styles.reasonHeader}>
            <span className={styles.reasonTitle}>
              {isActive ? "Disable" : "Enable"} &ldquo;{flag.label || flag.key}
              &rdquo;?
            </span>
            <button
              type="button"
              className={styles.reasonClose}
              onClick={handleCancel}
              aria-label="Cancel"
              disabled={isToggling}
            >
              <CloseOutlinedIcon fontSize="inherit" />
            </button>
          </div>
          <label className={styles.reasonLabel} htmlFor={`reason-${flag.key}`}>
            Reason for change
          </label>
          <textarea
            id={`reason-${flag.key}`}
            className={styles.reasonInput}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this feature being toggled?"
            disabled={isToggling}
          />
          <div className={styles.reasonActions}>
            <button
              type="button"
              className={styles.reasonConfirm}
              onClick={handleConfirm}
              disabled={isToggling || !reason.trim()}
            >
              {isToggling ? "Confirming…" : "Confirm toggle"}
            </button>
            <button
              type="button"
              className={styles.reasonCancel}
              onClick={handleCancel}
              disabled={isToggling}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <label className={styles.toggleRow} htmlFor={`flag-${flag.key}`}>
          <span className={styles.toggleLabel}>
            {isActive ? "Enabled" : "Disabled"}
          </span>
          <input
            id={`flag-${flag.key}`}
            type="checkbox"
            className={styles.toggleInput}
            checked={isActive}
            onChange={handleToggleRequest}
            disabled={isToggling}
          />
          <span className={styles.toggleTrack} aria-hidden="true">
            <span className={styles.toggleThumb} />
          </span>
        </label>
      )}
    </div>
  );
}

export default function FeatureFlags({
  flags = null,
  onToggle,
  isToggling = false,
  canManage = false,
}) {
  const flagList = flags || [];

  return (
    <section aria-labelledby="feature-flags-title">
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">
          <ToggleOnOutlinedIcon fontSize="inherit" />
        </span>
        <div>
          <h2 id="feature-flags-title" className={styles.title}>
            Feature Flags
          </h2>
          <p className={styles.subtitle}>
            Enable or disable platform features — backend-controlled
          </p>
        </div>
      </div>

      {flagList.length === 0 ? (
        <div className={styles.empty}>
          <p>No feature flags configured.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {flagList.map((flag) => (
            <FlagCard
              key={flag.key}
              flag={flag}
              onToggle={onToggle}
              isToggling={isToggling}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      <div className={styles.note}>
        Feature flags are backend-controlled. Toggle changes require backend
        confirmation.
      </div>
    </section>
  );
}
