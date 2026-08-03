export const SETTING_GROUPS = [
  { key: "general", label: "General", icon: "SettingsOutlined", dangerous: false, description: "Platform name, timezone, language defaults" },
  { key: "registration", label: "Registration & Verification", icon: "HowToRegOutlined", dangerous: false, description: "Sign-up requirements, email verification, age limits" },
  { key: "limits", label: "Device & Family Limits", icon: "DevicesOutlined", dangerous: false, description: "Max devices per plan, max family members" },
  { key: "sos", label: "SOS & Incident Policies", icon: "CampaignOutlined", dangerous: true, description: "Alert thresholds, auto-escalation, response SLAs" },
  { key: "geofence", label: "Geofence Defaults", icon: "FenceOutlined", dangerous: false, description: "Default radius, notification preferences" },
  { key: "parental", label: "Parental Control Defaults", icon: "FamilyRestroomOutlined", dangerous: false, description: "Screen time defaults, bedtime presets" },
  { key: "subscriptions", label: "Subscription Entitlements", icon: "CreditCardOutlined", dangerous: true, description: "Plan features, device/member limits, trial durations" },
  { key: "notifications", label: "Notification Config", icon: "NotificationsOutlined", dangerous: false, description: "Push/email templates, quiet hours" },
  { key: "content", label: "Content Defaults", icon: "DescriptionOutlined", dangerous: false, description: "Default audiences, review requirements" },
  { key: "maintenance", label: "Maintenance Mode", icon: "BuildOutlined", dangerous: true, description: "Platform-wide maintenance banner and access control" },
  { key: "features", label: "Feature Flags", icon: "ToggleOnOutlined", dangerous: true, description: "Enable/disable platform features — backend-controlled" },
  { key: "retention", label: "Data Retention", icon: "ArchiveOutlined", dangerous: true, description: "Location history, alert history, audit log retention periods" },
  { key: "integrations", label: "Integrations", icon: "HubOutlined", dangerous: false, description: "Third-party service connection status — no secrets exposed" },
];

export const DANGEROUS_GROUPS = SETTING_GROUPS.filter(g => g.dangerous).map(g => g.key);

export function normalizeSetting(raw) {
  if (!raw) return null;
  return {
    key: raw.key, value: raw.value, type: raw.type || "string",
    label: raw.label || raw.key, description: raw.description || "",
    lastUpdated: raw.lastUpdated || raw.updatedAt, lastEditor: raw.lastEditor || raw.updatedBy || "-",
    readOnly: Boolean(raw.readOnly), dangerous: Boolean(raw.dangerous),
    raw,
  };
}

export function formatDate(v) { if (!v) return "-"; const d = new Date(v); return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

export function validateSetting(type, value) {
  if (type === "number") { const n = Number(value); if (Number.isNaN(n)) return "Must be a number"; if (n < 0) return "Must be positive"; }
  if (type === "boolean" && typeof value !== "boolean") return "Must be true or false";
  if (type === "string" && typeof value !== "string") return "Must be text";
  return null;
}
