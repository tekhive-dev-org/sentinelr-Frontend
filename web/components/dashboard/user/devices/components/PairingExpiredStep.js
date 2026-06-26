import React from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "../PairDevice.module.css";

export default function PairingExpiredStep({ error, onGenerateNewCode, onCancel }) {
  return (
    <div className={styles.pairingCard}>
      <div className={styles.expiredIcon}>
        <ErrorOutlineIcon style={{ fontSize: 36, color: "#dc323f" }} />
      </div>

      <h2 className={styles.cardTitle}>Code Expired</h2>
      <p className={styles.cardDescription}>
        For your security, pairing codes expire after 10 minutes. Please,
        generate a new code to continue.
      </p>

      {error && (
        <div
          className={styles.errorMessage}
          style={{
            color: "#dc323f",
            backgroundColor: "#ffe1e4",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <button className={styles.primaryButton} onClick={onGenerateNewCode}>
        Generate New Code
      </button>

      <button
        className={styles.secondaryButton}
        onClick={onCancel}
        style={{ marginTop: "12px", width: "100%" }}
      >
        Cancel
      </button>
    </div>
  );
}
