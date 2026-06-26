import React, { useState, useEffect } from "react";
import s from "./DeviceDetailModal.module.css";
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
import LinkIcon from "@mui/icons-material/Link";

const DeviceIcon = ({ type, platform }) => {
  if (type === "Phone" && platform === "iOS") return <AppleIcon className={s.deviceHeroIcon} />;
  if (type === "Phone" && platform === "Android") return <AndroidIcon className={s.deviceHeroIcon} />;
  if (type === "Phone") return <SmartphoneIcon className={s.deviceHeroIcon} />;
  if (type === "Tablet") return <TabletIcon className={s.deviceHeroIcon} />;
  if (type === "Laptop") return <LaptopIcon className={s.deviceHeroIcon} />;
  if (type === "Watch") return <WatchIcon className={s.deviceHeroIcon} />;
  return <RouterIcon className={s.deviceHeroIcon} />;
};

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
        assignedUserId: editAssignedUserId ? Number(editAssignedUserId) : undefined,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update device.");
    } finally {
      setSaving(false);
    }
  };

  const assignedMember = familyMembers.find(
    (m) => Number(m.id) === Number(device.userId),
  );

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className={s.closeBtn} onClick={onClose} aria-label="Close">
          <CloseIcon className={s.closeIcon} />
        </button>

        {/* ── Hero ── */}
        <div className={s.hero}>
          <div className={s.avatarWrap}>
            <DeviceIcon type={device.type} platform={device.platform} />
          </div>
          <div className={s.heroInfo}>
            <h2 className={s.deviceName}>{device.deviceName || device.name}</h2>
            <p className={s.deviceMeta}>
              {device.type}
              {device.platform ? ` · ${device.platform}` : ""}
            </p>
            <span className={`${s.statusBadge} ${isPaired ? s.statusPaired : s.statusUnpaired}`}>
              <span className={s.statusDot} />
              {isPaired ? "Paired" : "Unpaired"}
            </span>
          </div>
        </div>

        {/* ── Info Grid ── */}
        <div className={s.infoGrid}>
          <div className={s.infoCell}>
            <div className={s.infoCellLabel}>Device ID</div>
            <div className={s.infoCellValue}>
              {device.id ? `••••${String(device.id).slice(-6)}` : "—"}
            </div>
          </div>
          <div className={s.infoCell}>
            <div className={s.infoCellLabel}>Assigned To</div>
            <div className={s.infoCellValue}>
              {assignedMember?.name || device?.assignedUser?.name || "Unassigned"}
            </div>
          </div>
          <div className={s.infoCell}>
            <div className={s.infoCellLabel}>Type</div>
            <div className={s.infoCellValue}>{device.type || "—"}</div>
          </div>
          <div className={s.infoCell}>
            <div className={s.infoCellLabel}>Platform</div>
            <div className={s.infoCellValue}>{device.platform || "Generic"}</div>
          </div>
        </div>

        {/* ── Device Settings ── */}
        <div className={s.section}>
          <div className={s.sectionHeader}>
            <h3 className={s.sectionTitle}>Device Settings</h3>
            {!isEditing && (
              <button className={s.editBtn} onClick={() => setIsEditing(true)}>
                <EditIcon className={s.inlineBtnIcon} />
                Edit
              </button>
            )}
          </div>

          {/* Device Name */}
          <div className={s.fieldRow}>
            <div className={s.fieldLabel}>Device Name</div>
            {isEditing ? (
              <input
                className={s.input}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter device name"
              />
            ) : (
              <div className={s.fieldValue}>{device.deviceName || device.name || "—"}</div>
            )}
          </div>

          {/* Assigned User */}
          <div className={s.fieldRow}>
            <div className={s.fieldLabel}>
              <SwapHorizIcon className={s.fieldLabelIcon} />
              Assigned To
            </div>
            {isEditing ? (
              <select
                className={s.select}
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
              <div className={s.fieldValue}>
                {assignedMember?.name || device?.assignedUser?.name || "Unassigned"}
              </div>
            )}
          </div>

          {error && <p className={s.errorMsg}>{error}</p>}

          {isEditing && (
            <div className={s.editActions}>
              <button className={s.btnSave} onClick={handleSave} disabled={saving}>
                <SaveIcon className={s.inlineBtnIcon} />
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                className={s.btnCancel}
                onClick={() => {
                  setIsEditing(false);
                  setEditName(device.deviceName);
                  setEditAssignedUserId(device.userId);
                  setError(null);
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className={s.divider} />

        {/* ── Device Actions ── */}
        <div className={s.actions}>
          <div className={`${s.sectionHeader} ${s.actionsHeader}`}>
            <h3 className={s.sectionTitle}>Device Actions</h3>
          </div>

          {isPaired && (
            <button
              className={`${s.actionBtn} ${s.btnUnpair}`}
              onClick={() => onUnpair && onUnpair(device)}
            >
              <LinkOffIcon className={s.actionIcon} />
              <div className={s.actionBtnContent}>
                <span className={s.actionBtnLabel}>Unpair Device</span>
                <span className={s.actionBtnHint}>Stays on dashboard with Unpaired status</span>
              </div>
            </button>
          )}

          {!isPaired && (
            <button
              className={`${s.actionBtn} ${s.btnRepair}`}
              onClick={() => onRepair && onRepair(device)}
            >
              <LinkIcon className={s.actionIcon} />
              <div className={s.actionBtnContent}>
                <span className={s.actionBtnLabel}>Re-pair Device</span>
                <span className={s.actionBtnHint}>Removes record and opens pairing screen</span>
              </div>
            </button>
          )}

          <button
            className={`${s.actionBtn} ${s.btnRemove}`}
            onClick={() => onRemove && onRemove(device)}
          >
            <DeleteOutlineIcon className={s.actionIcon} />
            <div className={s.actionBtnContent}>
              <span className={s.actionBtnLabel}>Remove from Dashboard</span>
              <span className={s.actionBtnHint}>Hides this device from your dashboard view</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}

