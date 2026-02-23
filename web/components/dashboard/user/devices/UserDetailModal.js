import React from "react";
import styles from "./DevicesAndUsers.module.css";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
  device,
  onPairDevice,
}) {
  if (!isOpen || !user) return null;

  

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const profileImage =
    user?.profilePictureUrl ||
    user?.profilePicture ||
    user?.avatarUrl ||
    user?.avatar ||
    user?.imageUrl ||
    user?.photoUrl;

  const controls = [
    {
      title: "Screen time limit",
      description:
        "Get notified whenever an anonymous activity is performed on your SENTINELR application.",
    },
    {
      title: "Application blocking",
      description:
        "Get all the latest updates on all new content releases and product features.",
    },
    {
      title: "Web filtering",
      description:
        "Get all the latest updates on all new content releases and product features.",
    },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.userDetailModal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* User Header Section */}
        <div className={styles.userDetailHeaderContainer}>
          <div className={styles.userDetailAvatar}>
            {profileImage ? (
              <img
                src={profileImage}
                alt={user.name || "User"}
                className={styles.userDetailAvatarImage}
              />
            ) : (
              getInitials(user.name || user.userName || user.email)
            )}
          </div>

          <div className={styles.userDetailContent}>
            <div className={styles.userDetailText}>
              <h2 className={styles.userDetailName}>{user.name}</h2>
              <p className={styles.userDetailEmail}>{user.email}</p>
            </div>

            <div className={styles.userDetailActionsRow}>
              <span
                className={`${styles.statusBadge} ${device?.status === "online" ? styles.statusOnlineBadge : styles.statusOfflineBadge}`}
              >
                <span className={styles.statusDotSmall}></span>
                {device?.status === "online" ? "Online" : "Offline"}
              </span>

              {device && device?.pairStatus !== "paired" && (
                <button
                  className={styles.pairDeviceBtn}
                  onClick={() => onPairDevice && onPairDevice(user)}
                >
                  <LinkIcon style={{ fontSize: 16 }} />
                  Pair Device
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.userDetailDivider}></div>

        {/* Active Controls Section */}
        <div className={styles.activeControlsSection}>
          <h3 className={styles.activeControlsTitle}>Active Controls</h3>
          <p className={styles.activeControlsSubtitle}>
            Below are user authorizations.
          </p>

          <div className={styles.controlsList}>
            {controls.map((control, index) => (
              <div key={index} className={styles.controlItem}>
                <h4 className={styles.controlTitle}>{control.title}</h4>
                <p className={styles.controlDescription}>
                  {control.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
