import React, { useState } from "react";
import styles from "./ConfirmationModal.module.css";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isDanger = false,
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isConfirming) return;

    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!isConfirming) onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          disabled={isConfirming}
          aria-label="Close confirmation modal"
        >
          <CloseIcon className={styles.closeIcon} />
        </button>

        <div className={styles.modalHeader}>
          <div className={`${styles.iconShell} ${isDanger ? styles.iconShellDanger : styles.iconShellWarning}`}>
            {isDanger ? (
              <ErrorOutlineIcon className={styles.dangerIcon} />
            ) : (
              <WarningAmberIcon className={styles.warningIcon} />
            )}
          </div>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>
              {isDanger ? "Destructive action" : "Device confirmation"}
            </span>
            <h3 className={styles.modalTitle}>{title}</h3>
          </div>
        </div>

        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={handleClose}
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.btnConfirm} ${isDanger ? styles.btnDanger : ""}`}
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
