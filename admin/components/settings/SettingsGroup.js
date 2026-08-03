import { useState, useEffect, useCallback } from "react";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import FenceOutlinedIcon from "@mui/icons-material/FenceOutlined";
import FamilyRestroomOutlinedIcon from "@mui/icons-material/FamilyRestroomOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import styles from "./SettingsGroup.module.css";
import { formatDate } from "../../utils/settingsAdapters";

const ICON_MAP = {
  SettingsOutlined: SettingsOutlinedIcon,
  HowToRegOutlined: HowToRegOutlinedIcon,
  DevicesOutlined: DevicesOutlinedIcon,
  CampaignOutlined: CampaignOutlinedIcon,
  FenceOutlined: FenceOutlinedIcon,
  FamilyRestroomOutlined: FamilyRestroomOutlinedIcon,
  CreditCardOutlined: CreditCardOutlinedIcon,
  NotificationsOutlined: NotificationsOutlinedIcon,
  DescriptionOutlined: DescriptionOutlinedIcon,
  BuildOutlined: BuildOutlinedIcon,
  ToggleOnOutlined: ToggleOnOutlinedIcon,
  ArchiveOutlined: ArchiveOutlinedIcon,
  HubOutlined: HubOutlinedIcon,
};

function SettingField({
  setting,
  localValue,
  onChange,
  disabled,
}) {
  const { type, label, description, lastEditor, lastUpdated } = setting;
  const id = `setting-${setting.key}`;

  const renderInput = () => {
    switch (type) {
      case "boolean":
        return (
          <label className={styles.toggle} htmlFor={id}>
            <input
              id={id}
              type="checkbox"
              className={styles.toggleInput}
              checked={Boolean(localValue)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
            />
            <span className={styles.toggleTrack} aria-hidden="true">
              <span className={styles.toggleThumb} />
            </span>
            <span className={styles.toggleLabel}>
              {localValue ? "Enabled" : "Disabled"}
            </span>
          </label>
        );

      case "number":
        return (
          <input
            id={id}
            type="number"
            className={styles.textInput}
            value={localValue ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );

      case "select":
        return (
          <select
            id={id}
            className={styles.selectInput}
            value={localValue ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          >
            {(setting.raw?.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "string":
      default:
        return (
          <input
            id={id}
            type="text"
            className={styles.textInput}
            value={localValue ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div
      className={`${styles.field} ${disabled ? styles.fieldDisabled : ""}`}
    >
      <div className={styles.fieldHeader}>
        <label className={styles.fieldLabel} htmlFor={id}>
          {label || setting.key}
          {disabled ? (
            <span className={styles.fieldLock} aria-hidden="true">
              <LockOutlinedIcon fontSize="inherit" />
            </span>
          ) : null}
        </label>
        {description ? (
          <p className={styles.fieldDescription}>{description}</p>
        ) : null}
      </div>
      <div className={styles.fieldInput}>{renderInput()}</div>
      <div className={styles.fieldMeta}>
        {lastEditor !== "-" ? (
          <span>Edited by {lastEditor}</span>
        ) : null}
        {lastUpdated ? (
          <span>{formatDate(lastUpdated)}</span>
        ) : null}
      </div>
    </div>
  );
}

export default function SettingsGroup({
  group,
  settings = null,
  onUpdate,
  isSaving = false,
  canManage = false,
  canManageDangerous = false,
}) {
  const Icon = ICON_MAP[group.icon] || SettingsOutlinedIcon;
  const isDangerousGroup = Boolean(group.dangerous);
  const editable = canManage && (!isDangerousGroup || canManageDangerous);

  const [localValues, setLocalValues] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const initial = {};
    settings.forEach((s) => {
      initial[s.key] = s.value;
    });
    setLocalValues(initial);
    setIsDirty(false);
  }, [settings]);

  const handleChange = useCallback((key, value) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const handleSave = () => {
    if (!onUpdate || !isDirty) return;
    onUpdate(
      Object.entries(localValues)
        .filter(([key, val]) => {
          const original = settings?.find((s) => s.key === key);
          return original && val !== original.value;
        })
        .map(([key, value]) => ({ key, value })),
    );
  };

  const handleDiscard = () => {
    if (!settings) return;
    const initial = {};
    settings.forEach((s) => {
      initial[s.key] = s.value;
    });
    setLocalValues(initial);
    setIsDirty(false);
  };

  const settingsList = settings || [];
  const anyFieldDisabled = !editable;

  return (
    <section className={styles.group} aria-labelledby={`group-${group.key}-title`}>
      <div className={styles.groupHeader}>
        <span className={styles.groupIcon} aria-hidden="true">
          <Icon fontSize="inherit" />
        </span>
        <div>
          <h2 id={`group-${group.key}-title`} className={styles.groupTitle}>
            {group.label}
          </h2>
          {group.description ? (
            <p className={styles.groupDescription}>{group.description}</p>
          ) : null}
        </div>
        {isDangerousGroup ? (
          <span className={styles.dangerBadge}>Dangerous</span>
        ) : null}
      </div>

      {settingsList.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No settings available for this group.</p>
        </div>
      ) : (
        <div className={styles.fields}>
          {settingsList.map((setting) => (
            <SettingField
              key={setting.key}
              setting={setting}
              localValue={localValues[setting.key]}
              onChange={(val) => handleChange(setting.key, val)}
              disabled={
                setting.readOnly || anyFieldDisabled
              }
            />
          ))}
        </div>
      )}

      {isDangerousGroup && !canManageDangerous ? (
        <div
          className={styles.restrictedBanner}
          role="tooltip"
        >
          <LockOutlinedIcon className={styles.restrictedIcon} />
          <span>
            Dangerous settings require elevated permissions. Contact a Super
            Admin to make changes.
          </span>
        </div>
      ) : null}

      <div className={styles.groupActions}>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={!isDirty || isSaving || !editable}
        >
          <SaveOutlinedIcon className={styles.buttonIcon} />
          {isSaving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          className={styles.discardButton}
          onClick={handleDiscard}
          disabled={!isDirty || isSaving}
        >
          <UndoOutlinedIcon className={styles.buttonIcon} />
          Discard
        </button>
      </div>
    </section>
  );
}
