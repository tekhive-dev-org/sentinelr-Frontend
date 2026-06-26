/**
 * HistoryActivityTrend
 * Renders the "Activity Trend" line chart using Recharts.
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import styles from './HistoryReports.module.css';

function formatDuration(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <div className={styles.chartTooltipLabel}>{label}</div>
      <div className={styles.chartTooltipValue}>
        Activity: <strong>{payload[0].value}h</strong>
      </div>
    </div>
  );
};

export default function HistoryActivityTrend({ data = [], totalMinutes = 0 }) {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h3 className={styles.sectionTitle}>Activity Trend</h3>
        <span className={styles.chartDuration}>{formatDuration(totalMinutes)}</span>
      </div>
      <div className={styles.chartPlaceholder}>
        {data.length === 0 ? (
          <div className={styles.emptyChart}>
            No activity data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(61, 9, 208, 0.08)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#8a7d9d' }}
                axisLine={{ stroke: 'rgba(61, 9, 208, 0.12)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#8a7d9d' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e6ae12"
                strokeWidth={2.5}
                dot={{ r: 0 }}
                activeDot={{ r: 5, stroke: '#e6ae12', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
