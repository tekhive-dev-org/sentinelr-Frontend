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
        <div
          className={styles.errorMessage}
          style={{
            color: "#dc323f",
            backgroundColor: "#ffe1e4",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
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
                  <Icon style={{ fontSize: 24 }} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Smartphone OS Selection */}
          {deviceType === "Phone" && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
              }}
            >
              <label
                className={styles.formLabel}
                style={{ marginBottom: "12px", fontSize: "13px" }}
              >
                Select Mobile Operating System
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSmartphoneOS("ios")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "6px",
                    border:
                      smartphoneOS === "ios"
                        ? "2px solid #1F2937"
                        : "1px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <AppleIcon
                    style={{
                      fontSize: 20,
                      color: smartphoneOS === "ios" ? "#000" : "#6B7280",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: smartphoneOS === "ios" ? "600" : "400",
                      color: smartphoneOS === "ios" ? "#000" : "#6B7280",
                    }}
                  >
                    iOS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSmartphoneOS("android")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "6px",
                    border:
                      smartphoneOS === "android"
                        ? "2px solid #1F2937"
                        : "1px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <AndroidIcon
                    style={{
                      fontSize: 20,
                      color: smartphoneOS === "android" ? "#3DDC84" : "#6B7280",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: smartphoneOS === "android" ? "600" : "400",
                      color: smartphoneOS === "android" ? "#000" : "#6B7280",
                    }}
                  >
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
