import React from "react";
import styles from "./ConfirmationModal.module.css";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isDanger = false,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {isDanger ? (
            <ErrorOutlineIcon className={styles.dangerIcon} />
          ) : (
            <WarningAmberIcon className={styles.warningIcon} />
          )}
          <h3 className={styles.modalTitle}>{title}</h3>
        </div>

        <div className={styles.modalBody}>{message}</div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${styles.btnConfirm} ${isDanger ? styles.btnDanger : ""}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
