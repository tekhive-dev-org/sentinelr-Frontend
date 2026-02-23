import React from "react";
import Image from "next/image";
import styles from "./DevicesAndUsers.module.css";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "Never";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000); // seconds
  if (diff < 60) return "Just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} minute${m !== 1 ? "s" : ""} ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h !== 1 ? "s" : ""} ago`;
  }
  const d = Math.floor(diff / 86400);
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

export default function DevicesList({
  devices = [],
  onAddDevice,
  onDeviceClick,
  loading = false,
  isAtDeviceLimit = false,
  maxDevices = null,
}) {
  if (loading) {
    return (
      <div
        className={styles.loadingContainer}
        style={{ padding: "40px", display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            border: "3px solid #E5E7EB",
            borderTopColor: "#1F2937",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `,
          }}
        />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className={styles.emptyState}>
        {/* Empty State Illustration */}
        <Image
          src="/assets/icons/device-empty.png"
          alt="No Devices"
          width={120}
          height={120}
          className={styles.emptyIllustration}
        />

        <h3 className={styles.emptyTitle}>No Devices Found</h3>
        <p className={styles.emptyDescription}>
          No devices match your current filters.
        </p>

        {isAtDeviceLimit ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#b45309",
              backgroundColor: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            <BlockIcon style={{ fontSize: 15 }} />
            Device limit reached ({maxDevices})
          </div>
        ) : (
          <button className={styles.addButton} onClick={onAddDevice}>
            <AddIcon className={styles.addButtonIcon} />
            Pair Device
            <ChevronRightIcon className={styles.addButtonIcon} />
          </button>
        )}
      </div>
    );
  }

  const [openMenuId, setOpenMenuId] = React.useState(null);

  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  return (
    <div className={styles.devicesTableContainer}>
      {/* Header row with device count + limit badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          padding: "0 4px",
        }}
      >
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          {devices.length}
          {maxDevices != null ? ` / ${maxDevices}` : ""} device
          {devices.length !== 1 ? "s" : ""}
        </span>

        {isAtDeviceLimit && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#b45309",
              backgroundColor: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: "8px",
              padding: "6px 12px",
            }}
          >
            <BlockIcon style={{ fontSize: 15 }} />
            Device limit reached ({maxDevices})
          </div>
        )}
      </div>

      {/* Devices Table */}
      <table className={styles.devicesTable}>
        <thead>
          <tr>
            <th>Device Name</th>
            <th>Device Type</th>
            <th>Battery Percentage</th>
            <th>Last Seen</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td className={styles.deviceNameCell}>
                {device.deviceName || device.name}
              </td>
              <td>
                {device.type === "Phone" && device.platform
                  ? device.platform.toLowerCase() === "ios"
                    ? "iOS"
                    : "Android"
                  : device.type || "—"}
              </td>
              <td>{device.batteryLevel}%</td>
              <td>{formatRelativeTime(device.lastSeen)}</td>
              <td>
                <span
                  className={`${styles.statusBadge} ${
                    device.pairStatus === "Paired" ||
                    device.pairStatus === "paired"
                      ? styles.statusOnlineBadge
                      : styles.statusOfflineBadge
                  }`}
                >
                  <span className={styles.statusDotSmall}></span>
                  {device.pairStatus === "Paired" ||
                  device.pairStatus === "paired"
                    ? "Paired"
                    : "Unpaired"}
                </span>
              </td>
              <td style={{ position: "relative" }}>
                <button
                  className={styles.tableActionBtn}
                  onClick={() => onDeviceClick && onDeviceClick(device)}
                >
                  <MoreVertIcon style={{ fontSize: 18 }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
