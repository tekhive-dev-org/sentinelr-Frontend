import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import styles from "./TrendCharts.module.css";

/* ── constants ── */

const DATE_RANGES = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "12m", label: "12m" },
];

const CHART_PANELS = [
  { key: "newUsers", title: "New Users", variant: "area" },
  { key: "activeUsers", title: "Active Users", variant: "area" },
  { key: "subscriptionGrowth", title: "Subscription Growth", variant: "area" },
  { key: "deviceActivity", title: "Device Activity", variant: "line" },
  { key: "sosIncidents", title: "SOS Incidents", variant: "line" },
];

/* ── helpers ── */

function isDataAvailable(trend) {
  return Array.isArray(trend) && trend.length > 0;
}

/* ── sub-components ── */

function ChartSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.shimmerBar} />
      <div className={styles.shimmerBar} style={{ width: "80%" }} />
      <div className={styles.shimmerBar} style={{ width: "90%" }} />
      <div className={styles.shimmerBarShort} />
      <div className={styles.shimmerBar} style={{ width: "70%" }} />
      <div className={styles.shimmerBarShort} />
    </div>
  );
}

function ChartUnavailable() {
  return (
    <div className={styles.stateWrap}>
      <p className={styles.unavailableText}>API not available</p>
    </div>
  );
}

function ChartError({ onRetry }) {
  return (
    <div className={styles.stateWrap}>
      <p className={styles.errorText}>Failed to load</p>
      {onRetry ? (
        <button type="button" className={styles.retryText} onClick={onRetry}>
          Tap to retry
        </button>
      ) : null}
    </div>
  );
}

function ChartBody({ data, variant, dataKey = "value" }) {
  if (variant === "line") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#3d09d0"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#3d09d0" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6ae12" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#e6ae12" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#3d09d0"
          strokeWidth={2}
          fill="url(#areaFill)"
          dot={false}
          activeDot={{ r: 4, fill: "#3d09d0" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartPanel({ title, data, isLoading, error, variant, onRetry }) {
  let content;

  if (isLoading) {
    content = <ChartSkeleton />;
  } else if (error) {
    content = <ChartError onRetry={onRetry} />;
  } else if (!isDataAvailable(data)) {
    content = <ChartUnavailable />;
  } else {
    content = <ChartBody data={data} variant={variant} />;
  }

  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>{title}</p>
      <div className={styles.chartWrap}>{content}</div>
    </div>
  );
}

/* ── main export ── */

export default function TrendCharts({
  trends,
  dateRange,
  onDateRangeChange,
  isLoading = false,
  errors = {},
  onRetry,
}) {
  const safeTrends = trends || {};
  return (
    <section className={styles.section}>
      {/* ── header ── */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <CalendarTodayOutlinedIcon className={styles.calendarIcon} fontSize="small" />
          <h2 className={styles.titleText}>Trends</h2>
        </div>

        <div className={styles.pills} role="group" aria-label="Date range">
          {DATE_RANGES.map((range) => (
            <button
              key={range.key}
              type="button"
              className={`${styles.pill} ${dateRange === range.key ? styles.pillActive : ""}`}
              onClick={() => onDateRangeChange?.(range.key)}
              aria-pressed={dateRange === range.key}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── chart grid ── */}
      <div className={styles.grid}>
        {CHART_PANELS.map((panel) => (
          <ChartPanel
            key={panel.key}
            title={panel.title}
            data={safeTrends[panel.key]}
            isLoading={isLoading}
            error={errors[panel.key]}
            variant={panel.variant}
            onRetry={errors[panel.key] && onRetry ? () => onRetry(panel.key) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
