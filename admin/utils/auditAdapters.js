export function normalizeAuditEntry(raw) {
  if (!raw) return null;
  return {
    id: raw.id, correlationId: raw.correlationId || raw.requestId || null,
    timestamp: raw.timestamp || raw.createdAt,
    timestampFormatted: formatDateTime(raw.timestamp || raw.createdAt),
    actor: raw.actorName || raw.actor?.userName || raw.adminName || "System",
    actorId: raw.actorId || raw.adminId || null,
    action: raw.action || "Unknown",
    actionLabel: getActionLabel(raw.action),
    resource: raw.resource || raw.resourceType || "-",
    resourceId: raw.resourceId || null,
    resourceLink: getResourceLink(raw.resource || raw.resourceType, raw.resourceId),
    outcome: raw.outcome || "success",
    outcomeLabel: raw.outcome === "failure" ? "Failed" : raw.outcome === "denied" ? "Denied" : "Success",
    reason: raw.reason || null,
    summary: buildSummary(raw),
    before: raw.before || null,
    after: raw.after || null,
    ipAddress: raw.ipAddress ? maskIP(raw.ipAddress) : null,
    deviceInfo: raw.deviceInfo || raw.userAgent || null,
    raw,
  };
}

function getActionLabel(action) {
  const labels = {
    "user.block": "Block User", "user.unblock": "Unblock User", "user.verify": "Verify Account",
    "user.suspend": "Suspend User", "user.restore": "Restore User", "user.delete": "Delete Account",
    "device.revoke": "Revoke Device", "device.unpair": "Unpair Device",
    "alert.acknowledge": "Acknowledge Alert", "alert.resolve": "Resolve Alert", "alert.escalate": "Escalate Alert",
    "alert.reopen": "Reopen Alert", "alert.assign": "Assign Alert",
    "subscription.change": "Change Plan", "subscription.cancel": "Cancel Subscription",
    "subscription.reactivate": "Reactivate Subscription",
    "content.publish": "Publish Content", "content.archive": "Archive Content",
    "role.assign": "Assign Role", "role.revoke": "Revoke Role",
    "admin.invite": "Invite Admin", "admin.deactivate": "Deactivate Admin",
    "setting.update": "Update Setting", "export.request": "Export Data",
    "login": "Login", "logout": "Logout", "session.revoke": "Revoke Sessions",
  };
  return labels[action] || action;
}

function getResourceLink(resource, id) {
  if (!id) return null;
  const map = { user: `/dashboard/users/${id}`, device: `/dashboard/devices/${id}`,
    alert: `/dashboard/alerts/${id}`, subscription: `/dashboard/subscriptions/${id}`,
    content: `/dashboard/content/${id}`, admin: `/dashboard/team/${id}`, setting: null };
  return map[resource] || null;
}

function buildSummary(raw) {
  if (raw.summary) return raw.summary;
  const parts = [];
  if (raw.action) parts.push(getActionLabel(raw.action));
  if (raw.resourceId) parts.push(`#${raw.resourceId}`);
  if (raw.reason) parts.push(`— ${raw.reason}`);
  return parts.join(" ") || "No details available";
}

function maskIP(ip) { if (!ip) return null; const p = ip.split("."); return p.length === 4 ? `${p[0]}.${p[1]}.*.*` : ip; }
export function formatDateTime(v) { if (!v) return "-"; const d = new Date(v); return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }); }

export const AUDIT_ACTIONS = ["user.block", "user.unblock", "user.verify", "user.suspend", "user.restore", "user.delete", "device.revoke", "device.unpair", "alert.acknowledge", "alert.resolve", "alert.escalate", "alert.reopen", "alert.assign", "subscription.change", "subscription.cancel", "subscription.reactivate", "content.publish", "content.archive", "role.assign", "role.revoke", "admin.invite", "admin.deactivate", "setting.update", "export.request", "login", "logout", "session.revoke"];

export const AUDIT_RESOURCES = ["user", "device", "alert", "subscription", "content", "role", "admin", "setting", "export"];

export const AUDIT_OUTCOMES = ["success", "failure", "denied"];
