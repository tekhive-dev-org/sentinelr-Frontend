export function normalizeUser(raw) {
  if (!raw) return null;

  const isBlocked = Boolean(raw.blocked);
  const isVerified = Boolean(raw.verified);
  const isSuspended = Boolean(raw.suspended) || raw.status === "suspended";

  return {
    id: raw.id,
    name: raw.userName || raw.name || raw.fullName || "Unknown",
    email: raw.email || "-",
    phone: raw.phone || raw.phoneNumber || "-",
    role: raw.role || "Parent",
    verified: isVerified,
    blocked: isBlocked,
    suspended: isSuspended,
    status: isSuspended ? "Suspended" : isBlocked ? "Blocked" : isVerified ? "Active" : "Flagged",
    statusType: isSuspended ? "suspended" : isBlocked ? "blocked" : isVerified ? "active" : "flagged",
    createdAt: formatDate(raw.createdAt),
    lastActive: formatDate(raw.updatedAt || raw.lastActive),
    raw,
  };
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name) {
  if (!name || name === "Unknown") return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export const ACCOUNT_TYPES = ["Parent", "Child", "Guardian", "Educator"];
