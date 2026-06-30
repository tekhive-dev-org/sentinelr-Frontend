import React from "react";
import styles from "./DevicesAndUsers.module.css";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import SmartphoneIcon from "@mui/icons-material/Smartphone";

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
  device,
  onPairDevice,
  onUnpairDevice,
  onRemoveMember,
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

  const hasPairedDevice =
    device &&
    (device.pairStatus === "paired" || device.pairStatus === "Paired");

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.userDetailModal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className={styles.userDetailCloseBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon className={styles.userDetailCloseIcon} />
        </button>

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
                {device?.status === "online"
                  ? "Online"
                  : device
                    ? "Offline"
                    : "No device"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.userDetailDivider}></div>

        {/* Device Pairing Section */}
        <div className={styles.memberDeviceSection}>
          <div className={styles.memberDeviceCard}>
            <div
              className={`${styles.memberDeviceIconWrap} ${
                hasPairedDevice
                  ? styles.memberDeviceIconPaired
                  : styles.memberDeviceIconEmpty
              }`}
            >
              {hasPairedDevice ? (
                <SmartphoneIcon className={styles.memberDeviceIcon} />
              ) : (
                <LinkIcon className={styles.memberDeviceIcon} />
              )}
            </div>

            <div className={styles.memberDeviceCopy}>
              <span className={styles.memberDeviceEyebrow}>
                Protected device
              </span>
              <h3 className={styles.memberDeviceTitle}>
                {hasPairedDevice
                  ? device.deviceName || device.name || "Paired device"
                  : "No device paired yet"}
              </h3>
              <p className={styles.memberDeviceDescription}>
                {hasPairedDevice
                  ? "This member already has a paired device. Unpair it if they no longer use it, or pair a new device if they are switching phones."
                  : "Pair this member's phone to enable location tracking, SOS alerts, and parental controls."}
              </p>
              {hasPairedDevice && (
                <div className={styles.memberDeviceMetaRow}>
                  <span>{device.type || "Mobile device"}</span>
                  <span>{device.platform || "Generic platform"}</span>
                  <span>{device.pairStatus || "Paired"}</span>
                </div>
              )}
            </div>

            <div className={styles.memberDeviceActions}>
              {hasPairedDevice && (
                <button
                  type="button"
                  className={`${styles.memberDeviceActionBtn} ${styles.memberDeviceUnpairBtn}`}
                  onClick={() => onUnpairDevice && onUnpairDevice(device)}
                >
                  <LinkOffIcon className={styles.memberDeviceActionIcon} />
                  Unpair
                </button>
              )}
              <button
                type="button"
                className={`${styles.memberDeviceActionBtn} ${styles.memberDevicePairBtn}`}
                onClick={() => onPairDevice && onPairDevice(user, device)}
              >
                <LinkIcon className={styles.memberDeviceActionIcon} />
                {hasPairedDevice ? "Pair new device" : "Pair device"}
              </button>
            </div>
          </div>
        </div>

        {/* Remove Member — Danger Zone */}
        <div className={styles.userDetailDivider}></div>
        <div className={styles.removeMemberSection}>
          <p className={styles.removeMemberWarning}>
            Removing this member will revoke their access to the family
            dashboard, unlink all their devices, and delete their parental
            control settings.
          </p>
          <button
            className={styles.removeMemberBtn}
            onClick={() => onRemoveMember && onRemoveMember(user)}
          >
            Remove Family Member
          </button>
        </div>
      </div>
    </div>
  );
}
