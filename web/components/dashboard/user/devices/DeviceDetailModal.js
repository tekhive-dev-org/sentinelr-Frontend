import React, { useState, useEffect } from "react";
import styles from "./DevicesAndUsers.module.css";
import CloseIcon from "@mui/icons-material/Close";
import RouterIcon from "@mui/icons-material/Router";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletIcon from "@mui/icons-material/Tablet";
import LaptopIcon from "@mui/icons-material/Laptop";
import WatchIcon from "@mui/icons-material/Watch";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const DeviceIcon = ({ type, platform, className }) => {
  const iconStyle = { fontSize: 32 };
  if (type === "Phone" && platform === "iOS")
    return <AppleIcon style={iconStyle} className={className} />;
  if (type === "Phone" && platform === "Android")
    return <AndroidIcon style={iconStyle} className={className} />;
  if (type === "Phone")
    return <SmartphoneIcon style={iconStyle} className={className} />;
  if (type === "Tablet")
    return <TabletIcon style={iconStyle} className={className} />;
  if (type === "Laptop")
    return <LaptopIcon style={iconStyle} className={className} />;
  if (type === "Watch")
    return <WatchIcon style={iconStyle} className={className} />;
  return <RouterIcon style={iconStyle} className={className} />;
};

import LinkIcon from "@mui/icons-material/Link";

export default function DeviceDetailModal({
  isOpen,
  onClose,
  device,
  onUnpair,
  onRemove,
  onRepair,
  onUpdate,
  familyMembers = [],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAssignedUserId, setEditAssignedUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (device) {
      setEditName(device.deviceName);
      // Priority: assignedUserId (the field we update) > userId (device owner) > memberUserId
      setEditAssignedUserId(device.userId);
    }
    setIsEditing(false);
    setError(null);
  }, [device]);

  if (!isOpen || !device) return null;

  const isPaired =
    device.pairStatus === "Paired" || device.pairStatus === "paired";

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onUpdate(device.id, {
        name: editName,
        assignedUserId: editAssignedUserId
          ? Number(editAssignedUserId)
          : undefined,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update device.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.userDetailModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: "absolute", top: 16, right: 16 }}>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Header */}
        <div className={styles.userDetailHeaderContainer}>
          <div className={styles.userDetailAvatar}>
            <DeviceIcon type={device.type} platform={device.platform} />
          </div>

          <div className={styles.userDetailContent}>
            <div className={styles.userDetailText}>
              <h2 className={styles.userDetailName}>
                {device.deviceName || device.name}
              </h2>
              <p className={styles.userDetailEmail}>
                {device.type} • {device.platform || "Generic"}
              </p>
            </div>

            <div className={styles.userDetailActionsRow}>
              <span
                className={`${styles.statusBadge} ${
                  isPaired
                    ? styles.statusOnlineBadge
                    : styles.statusOfflineBadge
                }`}
              >
                <span className={styles.statusDotSmall}></span>
                {isPaired ? "Paired" : "Unpaired"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.userDetailDivider}></div>

        {/* Device Info */}
        <div className={styles.activeControlsSection}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 className={styles.activeControlsTitle}>Device Settings</h3>
            {!isEditing && (
              <button
                className={styles.btnSecondary}
                style={{ padding: "6px 14px", fontSize: "13px" }}
                onClick={() => setIsEditing(true)}
              >
                <EditIcon
                  style={{
                    fontSize: 15,
                    marginRight: 4,
                    verticalAlign: "middle",
                  }}
                />
                Edit
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Device Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Device Name</label>
              {isEditing ? (
                <input
                  className={styles.formInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter device name"
                />
              ) : (
                <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>
                  {device.deviceName || device.name || "—"}
                </p>
              )}
            </div>

            {/* Assigned User */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <SwapHorizIcon
                  style={{
                    fontSize: 15,
                    marginRight: 4,
                    verticalAlign: "middle",
                  }}
                />
                Assigned To
              </label>
              {isEditing ? (
                <select
                  className={styles.formSelect}
                  value={editAssignedUserId}
                  onChange={(e) => setEditAssignedUserId(e.target.value)}
                >
                  <option value="">— Unassigned —</option>
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>
                  {familyMembers.find(
                    (m) =>
                      // Coerce both sides to Number to avoid string vs number mismatch
                      Number(m.id) === Number(device.userId),
                  )?.name ||
                    device?.assignedUser?.name ||
                    "Unassigned"}
                </p>
              )}
            </div>

            {error && (
              <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>
                {error}
              </p>
            )}

            {/* Edit Actions */}
            {isEditing && (
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  className={styles.btnPrimary}
                  style={{ flex: 1 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  <SaveIcon
                    style={{
                      fontSize: 15,
                      marginRight: 4,
                      verticalAlign: "middle",
                    }}
                  />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className={styles.btnSecondary}
                  style={{ flex: 1 }}
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(device.name);
                    setEditAssignedUserId(device.assignedUser.id);
                    setError(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.userDetailDivider}></div>

        {/* Device Actions */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "12px",
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Device Actions
          </p>

          {/* Unpair — only shown when device is currently Paired */}
          {isPaired && (
            <div>
              <button
                onClick={() => onUnpair && onUnpair(device)}
                className={styles.btnSecondary}
                style={{
                  width: "100%",
                  borderColor: "#d97706",
                  color: "#92400e",
                  backgroundColor: "#fffbeb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <LinkOffIcon style={{ fontSize: 17 }} />
                Unpair Device
              </button>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "11px",
                  color: "#9ca3af",
                  textAlign: "center",
                }}
              >
                Device stays on dashboard with "Unpaired" status
              </p>
            </div>
          )}

          {/* Re-pair — only shown when device is currently Unpaired */}
          {!isPaired && (
            <div>
              <button
                onClick={() => onRepair && onRepair(device)}
                className={styles.btnSecondary}
                style={{
                  width: "100%",
                  borderColor: "#2563eb",
                  color: "#1d4ed8",
                  backgroundColor: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <LinkIcon style={{ fontSize: 17 }} />
                Re-pair Device
              </button>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "11px",
                  color: "#9ca3af",
                  textAlign: "center",
                }}
              >
                Removes this record and opens the pairing screen
              </p>
            </div>
          )}

          {/* Remove from Dashboard */}
          <div>
            <button
              onClick={() => onRemove && onRemove(device)}
              className={styles.btnSecondary}
              style={{
                width: "100%",
                borderColor: "#ef4444",
                color: "#ef4444",
                backgroundColor: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <DeleteOutlineIcon style={{ fontSize: 17 }} />
              Remove from Dashboard
            </button>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "11px",
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              Hides device from this dashboard view
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
