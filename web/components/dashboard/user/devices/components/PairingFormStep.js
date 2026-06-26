import React from "react";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletIcon from "@mui/icons-material/Tablet";
import LaptopIcon from "@mui/icons-material/Laptop";
import WatchIcon from "@mui/icons-material/Watch";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";
import styles from "../PairDevice.module.css";

const deviceTypes = [
  { id: "Phone", label: "Smartphone", icon: SmartphoneIcon },
  { id: "Tablet", label: "Tablet", icon: TabletIcon },
  { id: "Laptop", label: "Laptop", icon: LaptopIcon },
  { id: "Watch", label: "Smartwatch", icon: WatchIcon },
];

export default function PairingFormStep({
  deviceName,
  setDeviceName,
  deviceType,
  setDeviceType,
  smartphoneOS,
  setSmartphoneOS,
  assignedUser,
  setAssignedUser,
  familyMembers,
  isGeneratingCode,
  error,
  onSubmit,
  onCancel,
}) {
  return (
    <div className={styles.pairingCard}>
      <h2 className={styles.cardTitle}>Add New Device</h2>
      <p className={styles.cardDescription}>
        Enter the device details to start the pairing process.
      </p>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Device Name */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Device Name</label>
          <input
            type="text"
            className={styles.formInput}
            placeholder="e.g., John's iPhone"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            required
            disabled={isGeneratingCode}
          />
        </div>

        {/* Device Type */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Device Type</label>
          <div className={styles.deviceTypeGrid}>
            {deviceTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = deviceType === type.id;
              const isDisabled =
                type.id === "Tablet" ||
                type.id === "Laptop" ||
                type.id === "Watch";
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`${styles.deviceTypeBtn} ${isSelected ? styles.deviceTypeBtnActive : ""}`}
                  onClick={() => setDeviceType(type.id)}
                  disabled={isDisabled || isGeneratingCode}
                >
                  <Icon className={styles.deviceTypeIcon} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Smartphone OS Selection */}
          {deviceType === "Phone" && (
            <div className={styles.osSelection}>
              <label className={`${styles.formLabel} ${styles.osLabel}`}>
                Select Mobile Operating System
              </label>
              <div className={styles.osOptions}>
                <button
                  type="button"
                  onClick={() => setSmartphoneOS("ios")}
                  className={`${styles.osButton} ${smartphoneOS === "ios" ? styles.osButtonActive : ""}`}
                >
                  <AppleIcon className={styles.osIcon} />
                  <span>
                    iOS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSmartphoneOS("android")}
                  className={`${styles.osButton} ${smartphoneOS === "android" ? styles.osButtonActive : ""}`}
                >
                  <AndroidIcon className={styles.osIcon} />
                  <span>
                    Android
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Assign to Family Member */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Assign to Member</label>
          {familyMembers.length === 0 ? (
            <p className={styles.noChildrenText}>
              No family members yet. Please add a member first from the Users
              tab.
            </p>
          ) : (
            <select
              className={styles.formSelect}
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              disabled={isGeneratingCode}
              required
            >
              <option value="">Select a member...</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onCancel}
            disabled={isGeneratingCode}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isGeneratingCode}
          >
            {isGeneratingCode ? "Generating..." : "+ Pair device"}
          </button>
        </div>
      </form>
    </div>
  );
}
