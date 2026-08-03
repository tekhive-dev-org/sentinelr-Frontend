export function normalizeDevice(raw) {
  if (!raw) return null;

  const lastSeen = raw.lastSeen || raw.lastSeenAt || raw.updatedAt;
  const isStale = isDeviceStale(lastSeen, raw.status);

  return {
    id: raw.id || raw.deviceId,
    name: raw.name || raw.deviceName || "Unnamed Device",
    platform: normalizePlatform(raw.platform || raw.os),
    osVersion: raw.osVersion || raw.os_version || "-",
    appVersion: raw.appVersion || raw.app_version || "-",
    status: normalizeStatus(raw.status || raw.pairStatus),
    statusType: getStatusType(raw.status || raw.pairStatus, isStale),
    pairedAt: formatDate(raw.pairedAt || raw.createdAt),
    lastSeen: formatDateTime(lastSeen),
    isStale,
    ownerName: raw.ownerName || raw.userName || "-",
    ownerId: raw.ownerId || raw.userId,
    familyName: raw.familyName || "-",
    familyId: raw.familyId,
    batteryLevel: raw.batteryLevel ?? raw.battery ?? null,
    raw,
  };
}

export function isDeviceStale(lastSeen, status) {
  if (!lastSeen) return true;
  if (status === "offline" || status === "inactive" || status === "revoked") return false;
  const staleThresholdMs = 30 * 60 * 1000;
  return Date.now() - new Date(lastSeen).getTime() > staleThresholdMs;
}

function normalizePlatform(platform) {
  if (!platform) return "Unknown";
  const p = platform.toLowerCase();
  if (p.includes("android")) return "Android";
  if (p.includes("ios") || p.includes("iphone")) return "iOS";
  return platform;
}

function normalizeStatus(status) {
  if (!status) return "Unknown";
  const s = status.toLowerCase();
  if (s === "online" || s === "active") return "Online";
  if (s === "offline" || s === "inactive") return "Offline";
  if (s === "unpaired") return "Unpaired";
  if (s === "revoked") return "Revoked";
  if (s === "pending") return "Pending";
  return status;
}

function getStatusType(status, isStale) {
  if (!status) return "unknown";
  const s = status.toLowerCase();
  if (s === "revoked") return "revoked";
  if (s === "unpaired") return "unpaired";
  if (s === "online" || s === "active") return isStale ? "stale" : "online";
  if (s === "offline" || s === "inactive") return "offline";
  if (s === "pending") return "pending";
  return "unknown";
}

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
}

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function getStaleLabel(lastSeen) {
  if (!lastSeen) return "Never connected";
  const ms = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function getBatteryLabel(level) {
  if (level === null || level === undefined) return null;
  if (level <= 10) return "critical";
  if (level <= 25) return "low";
  return "normal";
}
