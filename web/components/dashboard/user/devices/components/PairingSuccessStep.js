import React from "react";
import Image from "next/image";
import styles from "../PairDevice.module.css";

export default function PairingSuccessStep({
  deviceName,
  assignedUser,
  familyMembers,
  onViewDevices,
  onAddAnother,
}) {
  const memberName = familyMembers.find((m) => String(m.id) === String(assignedUser))?.name || "Child";

  return (
    <div className={styles.successContainer}>
      {/* Success Icon */}
      <div className={styles.successIconLarge}>
        <Image
          src="/assets/icons/pair-success.png"
          alt="Pairing Successful"
          width={120}
          height={120}
          className={styles.emptyIllustration}
        />
      </div>

      <h2 className={styles.successTitle}>Pairing Successful</h2>
      <p className={styles.successDescription}>
        You have successfully paired {deviceName || "your device"}. You are now
        synced and ready to use.
      </p>

      {/* Device Connection Card */}
      <div className={styles.deviceConnectionCard}>
        {/* Connection Illustration */}
        <div className={styles.connectionIllustration}>
          {/* Laptop Icon */}
          <div className={styles.laptopIcon}>
            <svg
              viewBox="0 0 48 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="4"
                width="40"
                height="26"
                rx="2"
                stroke="#374151"
                strokeWidth="2"
                fill="none"
              />
              <rect x="8" y="8" width="32" height="18" fill="#E5E7EB" />
              <path d="M0 32H48L44 38H4L0 32Z" fill="#374151" />
            </svg>
          </div>

          {/* Connection Line */}
          <div className={styles.connectionLine}>
            <div className={styles.connectionDot}></div>
          </div>

          {/* Phone Icon */}
          <div className={styles.phoneIcon}>
            <svg
              viewBox="0 0 24 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="1"
                width="22"
                height="38"
                rx="3"
                stroke="#374151"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="12" cy="35" r="2" fill="#374151" />
            </svg>
          </div>
        </div>

        {/* Device Info */}
        <div className={styles.pairedDeviceInfo}>
          <div className={styles.pairedDeviceDetails}>
            <div className={styles.deviceLabel}>
              <span className={styles.deviceTypeDot}></span>
              Mobile
            </div>
            <div className={styles.deviceNameBold}>
              {deviceName || "Device"}{" "}
              <span className={styles.deviceUserTag}>
                ({memberName}'s phone)
              </span>
            </div>
            <div className={styles.deviceStatusText}>Online • Active now</div>
          </div>
          <div className={styles.deviceThumbnail}>
            <Image
              src="/assets/icons/phone.png"
              alt="Pairing Successful"
              width={120}
              height={120}
            />
          </div>
        </div>

        <button className={styles.disconnectBtn}>Disconnect</button>
      </div>

      {/* Action Buttons */}
      <div className={styles.successActions}>
        <button className={styles.primaryButton} onClick={onViewDevices}>
          View Device
        </button>

        <button
          className={styles.secondaryButton}
          onClick={onAddAnother}
        >
          Add Another Device
        </button>
      </div>
    </div>
  );
}
