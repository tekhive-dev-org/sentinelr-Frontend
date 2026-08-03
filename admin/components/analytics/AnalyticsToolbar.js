import { useCallback } from "react";
import Tooltip from "@mui/material/Tooltip";
import styles from "./AnalyticsToolbar.module.css";

/* ── constants ── */

const DATE_RANGES = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "12m", label: "12m" },
  { key: "all", label: "All time" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "All Plans" },
  { value: "freemium", label: "Freemium" },
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "premium", label: "Premium" },
];

const PLATFORM_OPTIONS = [
  { value: "all", label: "All Platforms" },
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
];

const COUNTRY_OPTIONS = [{ value: "all", label: "All Countries / Regions" }];

const ACCOUNT_TYPE_OPTIONS = [
  { value: "all", label: "All Account Types" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "guardian", label: "Guardian" },
  { value: "educator", label: "Educator" },
];

/* ── main export ── */

export default function AnalyticsToolbar({
  range,
  onRangeChange,
  filters,
  onFilterChange,
}) {
  const handleFilterChange = useCallback(
    (key, value) => {
      onFilterChange?.({ ...filters, [key]: value });
    },
    [filters, onFilterChange],
  );

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Analytics controls">
      {/* ── pills + export ── */}
      <div className={styles.topRow}>
        <div className={styles.pills} role="group" aria-label="Date range">
          {DATE_RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`${styles.pill} ${range === r.key ? styles.pillActive : ""}`}
              onClick={() => onRangeChange?.(r.key)}
              aria-pressed={range === r.key}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className={styles.exportGroup}>
          <Tooltip title="Backend export required" arrow>
            <span className={styles.exportBtn} aria-disabled="true">
              Export CSV
            </span>
          </Tooltip>
          <Tooltip title="Backend export required" arrow>
            <span className={styles.exportBtn} aria-disabled="true">
              Export PDF
            </span>
          </Tooltip>
        </div>
      </div>

      {/* ── filters ── */}
      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filters?.plan ?? "all"}
          onChange={(e) => handleFilterChange("plan", e.target.value)}
          aria-label="Filter by plan"
        >
          {PLAN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters?.platform ?? "all"}
          onChange={(e) => handleFilterChange("platform", e.target.value)}
          aria-label="Filter by platform"
        >
          {PLATFORM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters?.country ?? "all"}
          onChange={(e) => handleFilterChange("country", e.target.value)}
          aria-label="Filter by country"
        >
          {COUNTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters?.accountType ?? "all"}
          onChange={(e) => handleFilterChange("accountType", e.target.value)}
          aria-label="Filter by account type"
        >
          {ACCOUNT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
