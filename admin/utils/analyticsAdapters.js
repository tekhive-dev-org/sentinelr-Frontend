export function hasComparisonData(metric) {
  return metric?.previous !== undefined && metric?.previous !== null;
}

export function getChangePercent(current, previous) {
  if (previous === undefined || previous === null || current === undefined || current === null) return null;
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export function getChangeLabel(change) {
  if (change === null) return null;
  if (change === 0) return "No change";
  if (change > 0) return `+${change}%`;
  return `${change}%`;
}

export function getChangeDirection(change) {
  if (change === null) return null;
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "neutral";
}

export const DATE_RANGES = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "12m", label: "12 months" },
  { key: "all", label: "All time" },
];

export const METRIC_DEFINITIONS = {
  "user-growth": { label: "User Growth", description: "New user registrations over the selected period. Includes all roles.", unit: "users" },
  "active-users": { label: "Active Users", description: "Users who performed at least one authenticated action within each interval.", unit: "users" },
  "device-adoption": { label: "Device Adoption", description: "Newly paired devices over the selected period.", unit: "devices" },
  "family-growth": { label: "Family Growth", description: "New families created over the selected period.", unit: "families" },
  "sos-trends": { label: "SOS Incidents", description: "SOS alerts triggered over the selected period. Does not include false alarms.", unit: "incidents" },
  "geofence-activity": { label: "Geofence Activity", description: "Geofence entry and exit events recorded over the selected period.", unit: "events" },
  "parental-adoption": { label: "Parental Controls", description: "Percentage of families with at least one parental control rule active.", unit: "%" },
  "subscription-metrics": { label: "Subscription Metrics", description: "New subscriptions started minus cancellations over the selected period.", unit: "subscriptions" },
  "app-versions": { label: "App Version Adoption", description: "Distribution of active devices across app versions.", unit: "devices" },
  "platform-health": { label: "Platform Health", description: "API response times, error rates, and uptime over the selected period. Backend-provided only.", unit: "varies" },
};
