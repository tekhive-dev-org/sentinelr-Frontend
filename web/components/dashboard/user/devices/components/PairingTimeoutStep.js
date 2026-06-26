import React from "react";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import styles from "../PairDevice.module.css";

export default function PairingTimeoutStep({ error, onTryAgain, onCancel }) {
  return (
    <div className={styles.pairingCard}>
      <div className={styles.timeoutIcon}>
        <WifiOffIcon style={{ fontSize: 36, color: "#F59E0B" }} />
      </div>

      <h2 className={styles.cardTitle}>Pairing Timed Out</h2>
      <p className={styles.cardDescription}>
        The connection took longer than expected. Please, ensure that both
        devices are nearby and connected to the internet
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

      <button className={styles.primaryButton} onClick={onTryAgain}>
        Try Again
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
