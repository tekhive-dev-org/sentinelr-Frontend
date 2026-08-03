import { ADMIN_ROLES } from "../constants/permissions";

export const ROLE_OPTIONS = Object.entries(ADMIN_ROLES).map(([key, value]) => ({
  key: value,
  label: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
}));

export function normalizeAdmin(raw) {
  if (!raw) return null;
  return {
    id: raw.id, name: raw.userName || raw.name || raw.email, email: raw.email || "-",
    roles: raw.roles || [raw.role].filter(Boolean),
    status: raw.status || "active", statusLabel: raw.status === "active" ? "Active" : raw.status === "invited" ? "Invited" : raw.status === "suspended" ? "Suspended" : "Deactivated",
    lastActive: formatDate(raw.lastActive || raw.lastLoginAt || raw.updatedAt),
    invitedAt: raw.invitedAt ? formatDate(raw.invitedAt) : null,
    mfaEnabled: Boolean(raw.mfaEnabled || raw.twoFactorEnabled),
    raw,
  };
}

export function normalizeActivity(raw) {
  if (!raw) return null;
  return {
    id: raw.id, action: raw.action || "Unknown", detail: raw.detail || "",
    target: raw.targetName || raw.targetId || "-",
    timestamp: formatDateTime(raw.timestamp || raw.createdAt),
    ipAddress: raw.ipAddress ? maskIP(raw.ipAddress) : "-",
    raw,
  };
}

function maskIP(ip) { if (!ip) return "-"; const parts = ip.split("."); if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`; return ip; }
export function formatDate(v) { if (!v) return "-"; const d = new Date(v); return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-"); }
export function formatDateTime(v) { if (!v) return "-"; const d = new Date(v); return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
export function getInitials(name) { if (!name) return "?"; const p = name.trim().split(" "); return p.length === 1 ? p[0][0]?.toUpperCase() || "?" : `${p[0][0] || ""}${p[1][0] || ""}`.toUpperCase(); }
