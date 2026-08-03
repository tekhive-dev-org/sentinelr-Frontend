import { useState } from "react";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import styles from "./MaintenanceCard.module.css";
import { formatDate } from "../../utils/settingsAdapters";

export default function MaintenanceCard({
  settings = null,
  onToggle,
  isToggling = false,
  canManage = false,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const maintenanceSetting = settings?.find((s) => s.key === "maintenance_mode");
  const isActive = maintenanceSetting?.value === true;

  const lastEditor = maintenanceSetting?.lastEditor;
  const lastUpdated = maintenanceSetting?.lastUpdated;

  const handleToggleClick = () => {
    if (isActive) {
      onToggle?.(false);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmEnable = () => {
    onToggle?.(true);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <section
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      aria-labelledby="maintenance-title"
    >
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">
          <BuildOutlinedIcon fontSize="inherit" />
        </span>
        <div>
          <h2 id="maintenance-title" className={styles.title}>
            Maintenance Mode
          </h2>
          <p className={styles.subtitle}>Platform-wide maintenance control</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Current status</span>
          <span
            className={`${styles.statusPill} ${
              isActive ? styles.statusActive : styles.statusInactive
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {!canManage ? (
          <div className={styles.restrictedBanner}>
            <LockOutlinedIcon className={styles.restrictedIcon} />
            <span>
              You do not have permission to toggle maintenance mode.
            </span>
          </div>
        ) : showConfirm ? (
          <div className={styles.confirmBox}>
            <WarningAmberOutlinedIcon className={styles.confirmIcon} />
            <div>
              <p className={styles.confirmTitle}>Enable maintenance mode?</p>
              <p className={styles.warningText}>
                Users will see a maintenance banner. Admins can still access the
                platform.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmButton}
                  onClick={handleConfirmEnable}
                  disabled={isToggling}
                >
                  <PowerSettingsNewOutlinedIcon className={styles.buttonIcon} />
                  {isToggling ? "Enabling…" : "Yes, enable"}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={isToggling}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {canManage && !showConfirm ? (
          <button
            type="button"
            className={`${styles.toggleButton} ${
              isActive ? styles.toggleButtonDanger : ""
            }`}
            onClick={handleToggleClick}
            disabled={isToggling}
          >
            <PowerSettingsNewOutlinedIcon className={styles.buttonIcon} />
            {isToggling
              ? "Toggling…"
              : isActive
                ? "Disable maintenance mode"
                : "Enable maintenance mode"}
          </button>
        ) : null}
      </div>

      <div className={styles.footer}>
        <p className={styles.warningText}>
          Users will see a maintenance banner. Admins can still access the
          platform.
        </p>
        {lastEditor && lastEditor !== "-" ? (
          <p className={styles.meta}>
            Last toggled by <strong>{lastEditor}</strong>
            {lastUpdated ? ` — ${formatDate(lastUpdated)}` : ""}
          </p>
        ) : null}
      </div>
    </section>
  );
}
