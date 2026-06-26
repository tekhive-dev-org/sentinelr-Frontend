import React from "react";
import { QRCodeSVG } from "qrcode.react";
import styles from "../PairDevice.module.css";

export default function PairingQrStep({
  qrCodeData,
  pairingCode,
  deviceName,
  onBack,
}) {
  // Use QR data from API or fallback to generated URL
  const qrData =
    qrCodeData ||
    `sentinelr://pair?code=${pairingCode}&name=${encodeURIComponent(deviceName || "Device")}`;

  return (
    <div className={styles.pairingCard}>
      <h2 className={styles.cardTitle}>Scan QR Code</h2>
      <p className={styles.cardDescription}>
        Ensure to scan this QR in app to pair device.
      </p>

      <div className={styles.qrCodeContainer}>
        {qrCodeData && qrCodeData.startsWith("data:image") ? (
          // If API returns a base64 image, display it directly
          <img
            src={qrCodeData}
            alt="Pairing QR Code"
            className={styles.qrCodeImage}
          />
        ) : (
          // Otherwise generate QR from code
          <QRCodeSVG
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        )}
      </div>

      <button className={styles.backLink} onClick={onBack}>
        ← Back to pairing code
      </button>
    </div>
  );
}
