import { useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import ChartCard from "./ChartCard";
import { getChangePercent, getChangeLabel } from "../../utils/analyticsAdapters";
import styles from "./AnalyticsCharts.module.css";

/* ── brand colors ── */

const COLORS = {
  primary: "#e06f29",
  secondary: "#3d09d0",
  green: "#16a34a",
  red: "#dc323f",
  amber: "#e6ae12",
};

/* ── chart definitions ── */

const CHART_DEFS = [
  {
    key: "user-growth",
    title: "User Growth",
    description: "New user registrations over the selected period.",
    variant: "area",
    color: COLORS.secondary,
  },
  {
    key: "active-users",
    title: "Active Users",
    description: "Users who performed at least one authenticated action within each interval.",
    variant: "area",
    color: COLORS.primary,
  },
  {
    key: "device-adoption",
    title: "Device Adoption",
    description: "Newly paired devices over the selected period.",
    variant: "bar",
    color: COLORS.green,
  },
  {
    key: "family-growth",
    title: "Family Growth",
    description: "New families created over the selected period.",
    variant: "line",
    color: COLORS.secondary,
  },
  {
    key: "sos-trends",
    title: "SOS Trends",
    description: "SOS alerts triggered over the selected period. Does not include false alarms.",
    variant: "area",
    color: COLORS.red,
  },
  {
    key: "geofence-activity",
    title: "Geofence Activity",
    description: "Geofence entry and exit events recorded over the selected period.",
    variant: "bar",
    color: COLORS.amber,
  },
  {
    key: "parental-adoption",
    title: "Parental Adoption",
    description: "Percentage of families with at least one parental control rule active.",
    variant: "line",
    color: COLORS.green,
    isPercentage: true,
  },
  {
    key: "subscription-metrics",
    title: "Subscription Metrics",
    description: "New subscriptions started minus cancellations over the selected period.",
    variant: "area",
    color: COLORS.primary,
    hasNetLine: true,
  },
  {
    key: "app-versions",
    title: "App Versions",
    description: "Distribution of active devices across app versions.",
    variant: "horizontalBar",
    color: COLORS.secondary,
  },
  {
    key: "platform-health",
    title: "Platform Health",
    description: "API response times, error rates, and uptime over the selected period.",
    variant: "line",
    color: COLORS.green,
    thresholds: true,
  },
];

/* ── gradient defs ── */

function GradientDefs() {
  return (
    <defs>
      <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3} />
        <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="fillSecondary" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0.3} />
        <stop offset="100%" stopColor={COLORS.secondary} stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="fillRed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.25} />
        <stop offset="100%" stopColor={COLORS.red} stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.2} />
        <stop offset="100%" stopColor={COLORS.green} stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="fillAmber" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.2} />
        <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0.02} />
      </linearGradient>
    </defs>
  );
}

const FILL_IDS = {
  "#e06f29": "url(#fillPrimary)",
  "#3d09d0": "url(#fillSecondary)",
  "#dc323f": "url(#fillRed)",
  "#16a34a": "url(#fillGreen)",
  "#e6ae12": "url(#fillAmber)",
};

/* ── custom tooltip ── */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className={styles.tooltipWrap}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry, idx) => {
        const val = entry.value;
        const isComp = entry.dataKey === "comparison";

        return (
          <div key={idx} className={styles.tooltipRow}>
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className={isComp ? styles.tooltipComparison : styles.tooltipCurrent}>
              {val?.toLocaleString?.() ?? val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CustomTooltipWithChange({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const current = payload.find((p) => p.dataKey === "value");
  const comparison = payload.find((p) => p.dataKey === "comparison");
  const change =
    current && comparison
      ? getChangePercent(current.value, comparison.value)
      : null;

  return (
    <div className={styles.tooltipWrap}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry, idx) => {
        const isComp = entry.dataKey === "comparison";
        return (
          <div key={idx} className={styles.tooltipRow}>
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className={isComp ? styles.tooltipComparison : styles.tooltipCurrent}>
              {entry.value?.toLocaleString?.() ?? entry.value}
            </span>
          </div>
        );
      })}
      {change !== null && (
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipComparison}>Change:</span>
          <span
            className={`${styles.tooltipChange} ${
              change > 0
                ? styles.tooltipChangeUp
                : change < 0
                  ? styles.tooltipChangeDown
                  : ""
            }`}
          >
            {getChangeLabel(change)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── chart renderers ── */

function AreaChartView({ data, color, hasComparison, hasNetLine }) {
  const fillId = FILL_IDS[color] || "url(#fillPrimary)";
  const compareData = hasComparison ? data : null;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <GradientDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <RechartsTooltip
          content={hasComparison ? <CustomTooltipWithChange /> : <CustomTooltip />}
        />
        {compareData ? (
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="line"
          />
        ) : null}
        <Area
          type="monotone"
          dataKey="value"
          name="Current"
          stroke={color}
          strokeWidth={2}
          fill={fillId}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
        {hasComparison && (
          <Area
            type="monotone"
            dataKey="comparison"
            name="Previous"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="none"
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
        )}
        {hasNetLine && (
          <Line
            type="monotone"
            dataKey="net"
            name="Net"
            stroke={COLORS.green}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: COLORS.green }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function LineChartView({ data, color, hasComparison, isPercentage, thresholds }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          unit={isPercentage ? "%" : undefined}
        />
        <RechartsTooltip
          content={hasComparison ? <CustomTooltipWithChange /> : <CustomTooltip />}
        />
        {hasComparison ? (
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="line"
          />
        ) : null}
        <Line
          type="monotone"
          dataKey="value"
          name="Current"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
        {hasComparison && (
          <Line
            type="monotone"
            dataKey="comparison"
            name="Previous"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
        )}
        {thresholds && (
          <>
            <Line
              type="monotone"
              dataKey="warningThreshold"
              name="Warning"
              stroke={COLORS.amber}
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="criticalThreshold"
              name="Critical"
              stroke={COLORS.red}
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarChartView({ data, color, hasComparison }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <RechartsTooltip
          content={hasComparison ? <CustomTooltipWithChange /> : <CustomTooltip />}
        />
        <Bar
          dataKey="value"
          name="Current"
          fill={color}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        {hasComparison && (
          <Bar
            dataKey="comparison"
            name="Previous"
            fill={color}
            fillOpacity={0.3}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarChartView({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          name="Devices"
          fill={color}
          radius={[0, 4, 4, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── chart dispatcher ── */

function ChartRenderer({ def, data }) {
  const { variant, color } = def;
  const hasComparison = Array.isArray(data) && data.length > 0 && data[0]?.comparison !== undefined;

  switch (variant) {
    case "area":
      return (
        <AreaChartView
          data={data}
          color={color}
          hasComparison={hasComparison}
          hasNetLine={def.hasNetLine}
        />
      );
    case "bar":
      return (
        <BarChartView data={data} color={color} hasComparison={hasComparison} />
      );
    case "horizontalBar":
      return <HorizontalBarChartView data={data} color={color} />;
    case "line":
    default:
      return (
        <LineChartView
          data={data}
          color={color}
          hasComparison={hasComparison}
          isPercentage={def.isPercentage}
          thresholds={def.thresholds}
        />
      );
  }
}

/* ── main export ── */

export default function AnalyticsCharts({ metrics, metricErrors, isLoading }) {
  return (
    <div className={styles.grid} aria-label="Analytics charts">
      {CHART_DEFS.map((def) => (
        <ChartCard
          key={def.key}
          title={def.title}
          description={def.description}
          metricKey={def.key}
          data={metrics?.[def.key]}
          error={metricErrors?.[def.key]}
          isLoading={isLoading}
        >
          {metrics?.[def.key] && Array.isArray(metrics[def.key]) && metrics[def.key].length > 0 ? (
            <ChartRenderer def={def} data={metrics[def.key]} />
          ) : null}
        </ChartCard>
      ))}
    </div>
  );
}
