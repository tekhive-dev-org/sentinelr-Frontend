import React from "react";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import styles from "../PairDevice.module.css";

export default function PairingConnectingStep({
  deviceName,
  progress,
  onCancel,
  handleRefreshCode,
}) {
  return (
    <div className={styles.connectingContainer}>
      <div className={styles.deviceIconLarge}>
        <div className={styles.deviceIconRing}>
          <SmartphoneIcon style={{ fontSize: 40, color: "#1F2937" }} />
        </div>
        <div className={styles.signalWaves}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className={styles.pairingCard}>
        <div className={styles.connectingIcon}>
          <div className={styles.spinner}></div>
        </div>

        <h2 className={styles.cardTitle}>
          Connecting to{" "}
          <span className={styles.deviceNameHighlight}>{deviceName}</span>...
        </h2>
        <p className={styles.cardDescription}>
          Please, keep your device close and the app open.
        </p>

        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>Searching for signal...</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <button
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Cancel Pairing
        </button>

        <button className={styles.regenerateButton} onClick={handleRefreshCode}>
          Regenerate Code
        </button>
      </div>
    </div>
  );
}
