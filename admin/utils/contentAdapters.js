export const CONTENT_TYPES = [
  { key: "help", label: "Help Article" },
  { key: "faq", label: "FAQ" },
  { key: "safety", label: "Safety Tip" },
  { key: "onboarding", label: "Onboarding" },
  { key: "announcement", label: "Announcement" },
  { key: "privacy", label: "Privacy / Terms Ref" },
  { key: "maintenance", label: "Maintenance Notice" },
];

export const CONTENT_STATUSES = ["draft", "scheduled", "published", "archived", "expired"];

export const AUDIENCES = ["all", "parent", "child", "guardian", "educator"];

export function normalizeContent(raw) {
  if (!raw) return null;
  return {
    id: raw.id, title: raw.title || "Untitled", type: raw.type || "help",
    typeLabel: CONTENT_TYPES.find(t => t.key === raw.type)?.label || raw.type,
    status: raw.status || "draft", audience: raw.audience || "all",
    audienceLabel: raw.audience === "all" ? "All users" : raw.audience,
    author: raw.authorName || raw.author?.userName || "-",
    createdAt: formatDate(raw.createdAt), updatedAt: formatDate(raw.updatedAt),
    publishedAt: raw.publishedAt ? formatDate(raw.publishedAt) : null,
    scheduledAt: raw.scheduledAt || null,
    version: raw.version || 1,
    raw,
  };
}

export function normalizeCampaign(raw) {
  if (!raw) return null;
  return {
    id: raw.id, title: raw.title || "Untitled",
    channel: raw.channel || "in_app", channelLabel: getChannelLabel(raw.channel),
    status: raw.status || "draft", statusLabel: getStatusLabel(raw.status),
    audience: raw.audience || "all", audienceLabel: raw.audience === "all" ? "All users" : raw.audience,
    sentCount: raw.sentCount ?? 0, deliveredCount: raw.deliveredCount ?? 0,
    failedCount: raw.failedCount ?? 0, openedCount: raw.openedCount ?? 0,
    createdAt: formatDate(raw.createdAt), scheduledAt: raw.scheduledAt || null,
    sentAt: raw.sentAt ? formatDate(raw.sentAt) : null,
    needsApproval: Boolean(raw.needsApproval), approved: Boolean(raw.approved),
    raw,
  };
}

function getChannelLabel(ch) {
  return { in_app: "In-App", push: "Push", email: "Email" }[ch] || ch;
}
function getStatusLabel(st) {
  return { draft: "Draft", scheduled: "Scheduled", pending_approval: "Pending Approval", sending: "Sending", sent: "Sent", delivered: "Delivered", failed: "Failed", cancelled: "Cancelled" }[st] || st;
}
export function formatDate(v) {
  if (!v) return "-"; const d = new Date(v); return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
}
