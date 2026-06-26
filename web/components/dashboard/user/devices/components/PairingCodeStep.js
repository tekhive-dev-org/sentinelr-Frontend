import React from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import styles from "../PairDevice.module.css";

export default function PairingCodeStep({
  pairingCode,
  error,
  isGeneratingCode,
  timeRemaining,
  formatTime,
  copied,
  handleRefreshCode,
  handleCopyCode,
  onScanQr,
}) {
  return (
    <div className={styles.pairingCard}>
      <h2 className={styles.cardTitle}>Your Pairing Code</h2>
      <p className={styles.cardDescription}>
        Enter this code on your other device to securely pair your devices.
      </p>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.codeContainer}>
        {pairingCode.split("").map((char, index) => (
          <div key={index} className={styles.codeDigit}>
            {char}
          </div>
        ))}
      </div>

      <div className={styles.codeActions}>
        <button
          className={styles.refreshLink}
          onClick={handleRefreshCode}
          disabled={isGeneratingCode}
        >
          {isGeneratingCode ? "Generating..." : "Refresh code"}
        </button>
        <span className={styles.expiryText}>
          Code expires in <strong>{formatTime(timeRemaining)}</strong>
        </span>
      </div>

      <button className={styles.copyButton} onClick={handleCopyCode}>
        <ContentCopyIcon className={styles.buttonIcon} />
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>

      <div className={styles.divider}>
        <span>OR</span>
      </div>

      <button className={styles.qrButton} onClick={onScanQr}>
        <QrCode2Icon className={styles.buttonIcon} />
        Scan QR Code
      </button>
    </div>
  );
}
