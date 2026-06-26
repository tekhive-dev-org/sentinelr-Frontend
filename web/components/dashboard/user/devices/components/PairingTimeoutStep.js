import React from "react";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import styles from "../PairDevice.module.css";

export default function PairingTimeoutStep({ error, onTryAgain, onCancel }) {
  return (
    <div className={styles.pairingCard}>
      <div className={styles.timeoutIcon}>
        <WifiOffIcon className={styles.stateIcon} />
      </div>

      <h2 className={styles.cardTitle}>Pairing Timed Out</h2>
      <p className={styles.cardDescription}>
        The connection took longer than expected. Please, ensure that both
        devices are nearby and connected to the internet
      </p>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <button className={styles.primaryButton} onClick={onTryAgain}>
        Try Again
      </button>

      <button
        className={`${styles.secondaryButton} ${styles.stackedButton}`}
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}
