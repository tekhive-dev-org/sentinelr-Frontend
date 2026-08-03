export function normalizeAlert(raw) {
  if (!raw) return null;

  const severity = mapSeverity(raw.severity || raw.priority);
  const status = mapStatus(raw.status);

  return {
    id: raw.id || raw.alertId,
    incidentCode: raw.incidentCode || `INC-${String(raw.id).padStart(6, "0")}`,
    type: raw.type || "sos",
    typeLabel: getTypeLabel(raw.type),
    severity,
    severityLabel: getSeverityLabel(severity),
    status,
    statusLabel: getStatusLabel(status),
    source: raw.source || "user",
    sourceLabel: raw.source === "geofence" ? "Geofence" : raw.source === "device" ? "Device Agent" : "User",
    userName: raw.userName || raw.user?.userName || "Unknown",
    userId: raw.userId || raw.user?.id,
    deviceName: raw.deviceName || raw.device?.deviceName || "-",
    deviceId: raw.deviceId || raw.device?.id,
    locationLabel: raw.locationLabel || raw.location?.label || "Location unavailable",
    locationAvailable: Boolean(raw.locationLabel || raw.location?.label || raw.location?.latitude),
    assignedTo: raw.assignedTo || raw.assignee?.name || null,
    assigneeId: raw.assigneeId || raw.assignee?.id || null,
    contactState: raw.contactState || null,
    falseAlarm: Boolean(raw.falseAlarm),
    createdAt: raw.createdAt,
    acknowledgedAt: raw.acknowledgedAt || null,
    resolvedAt: raw.resolvedAt || null,
    raw,
  };
}

function mapSeverity(severity) {
  if (!severity) return "medium";
  const s = String(severity).toLowerCase();
  if (s === "critical" || s === "high") return "high";
  if (s === "medium" || s === "moderate") return "medium";
  if (s === "low") return "low";
  return "medium";
}

function getSeverityLabel(severity) {
  return { high: "Critical", medium: "Medium", low: "Low" }[severity] || severity;
}

function mapStatus(status) {
  if (!status) return "active";
  const s = String(status).toLowerCase();
  if (s === "acknowledged") return "acknowledged";
  if (s === "escalated") return "escalated";
  if (s === "resolved") return "resolved";
  if (s === "dismissed" || s === "false_alarm") return "falseAlarm";
  return "active";
}

function getStatusLabel(status) {
  return {
    active: "Active", acknowledged: "Acknowledged", escalated: "Escalated",
    resolved: "Resolved", falseAlarm: "False Alarm",
  }[status] || status;
}

function getTypeLabel(type) {
  if (!type) return "SOS";
  const t = String(type).toLowerCase();
  if (t.includes("sos")) return "SOS";
  if (t.includes("intruder")) return "Intruder";
  if (t.includes("geofence")) return "Geofence";
  if (t.includes("screen")) return "Screen Time";
  return type;
}

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatRelativeTime(value) {
  if (!value) return "";
  const ms = Date.now() - new Date(value).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
