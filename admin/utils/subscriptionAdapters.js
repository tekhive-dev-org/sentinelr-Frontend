export function normalizeSubscription(raw) {
  if (!raw) return null;
  return {
    id: raw.id || raw.subscriptionId,
    userName: raw.userName || raw.user?.userName || "Unknown",
    userId: raw.userId || raw.user?.id,
    email: raw.email || raw.user?.email || "-",
    planName: raw.planName || raw.plan?.name || "Unknown Plan",
    planId: raw.planId || raw.plan?.id,
    status: normalizeStatus(raw.status),
    statusType: raw.status || "active",
    billingPeriod: raw.billingPeriod || "monthly",
    currency: raw.currency || "USD",
    amount: raw.amount ?? null,
    startedAt: raw.startedAt || raw.createdAt,
    currentPeriodEnd: raw.currentPeriodEnd || raw.renewalDate,
    trialEndsAt: raw.trialEndsAt || null,
    cancelledAt: raw.cancelledAt || null,
    provider: raw.provider || raw.paymentProvider || null,
    providerReference: maskProviderRef(raw.providerReference || raw.paymentMethodId),
    lastPaymentAt: raw.lastPaymentAt || null,
    lastPaymentAmount: raw.lastPaymentAmount ?? null,
    failedPaymentCount: raw.failedPaymentCount ?? 0,
    deviceLimit: raw.deviceLimit ?? null,
    memberLimit: raw.memberLimit ?? null,
    raw,
  };
}

function normalizeStatus(status) {
  if (!status) return "Unknown";
  const s = String(status).toLowerCase();
  if (s === "active") return "Active";
  if (s === "trialing") return "Trial";
  if (s === "past_due" || s === "past-due") return "Past Due";
  if (s === "cancelled" || s === "canceled") return "Cancelled";
  if (s === "expired") return "Expired";
  if (s === "paused") return "Paused";
  return status;
}

export function getStatusType(status) {
  if (!status) return "unknown";
  const s = String(status).toLowerCase();
  if (s === "active") return "active";
  if (s === "trialing") return "trial";
  if (s === "past_due" || s === "past-due") return "pastDue";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  if (s === "expired") return "expired";
  if (s === "paused") return "paused";
  return "unknown";
}

function maskProviderRef(ref) {
  if (!ref) return null;
  if (ref.length <= 8) return ref;
  return `${ref.slice(0, 4)}...${ref.slice(-4)}`;
}

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
}

export function formatCurrency(amount, currency = "USD") {
  if (amount === null || amount === undefined) return "-";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function getRenewalLabel(endDate, status) {
  if (!endDate) return "-";
  if (status === "cancelled" || status === "expired") return "—";
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `${days} days`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
  return `${Math.ceil(days / 30)} months`;
}
