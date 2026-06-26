import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, BarChart, Bar } from 'recharts';
import styles from './UsageChart.module.css';
import { ChartSkeleton } from '../../../ui/loaders';

export default function UsageChart({ chartType, data, loading }) {
  const lineColor = '#e06f29';
  const barColor1 = '#3d09d0';
  const barColor2 = '#e06f29';
  const barColor3 = '#e6ae12';
  const averageUsage = data?.length
    ? data.reduce((sum, item) => sum + Number(item.usage || 0), 0) / data.length
    : 0;
  const wholeHours = Math.floor(averageUsage);
  const minutes = Math.round((averageUsage - wholeHours) * 60);
  const averageLabel = `${wholeHours ? `${wholeHours}h` : ''}${minutes ? ` ${minutes}m` : ''}`.trim() || '0m';

  return (
    <div className={styles.chartContainer}>
        <div className={styles.header}>
            <div className={styles.headerMeta}>
                <span className={styles.metaLabel}>Avg Screen Time</span>
                <span className={styles.timeHighlight}>{averageLabel}</span>
            </div>
            <div className={styles.legend}>
              <span><i className={styles.legendPrimary} />Focused usage</span>
              <span><i className={styles.legendSecondary} />Social</span>
              <span><i className={styles.legendTertiary} />Other</span>
            </div>
        </div>

      {loading ? (
        <ChartSkeleton variant={chartType === 'graph' ? 'line' : 'bar'} height="200px" />
      ) : (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            {chartType === 'graph' ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {/* Hide grid lines for clean look or use minimal */}
                {/* <CartesianGrid vertical={false} stroke="#f3f4f6" /> */}
                <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7c7189', fontSize: 12 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7c7189', fontSize: 12 }} 
                    domain={[0, 10]}
                    tickCount={6}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '14px', border: '1px solid rgba(61, 9, 208, 0.1)', boxShadow: '0 14px 30px rgba(61, 9, 208, 0.14)' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="usage" 
                    stroke={lineColor} 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6, fill: lineColor, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7c7189', fontSize: 12 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#7c7189', fontSize: 12 }} 
                    domain={[0, 10]}
                    tickCount={6}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                {/* Stacked Bars */}
                <Bar dataKey="s1" stackId="a" fill={barColor1} radius={[0, 0, 0, 0]} />
                <Bar dataKey="s2" stackId="a" fill={barColor2} radius={[0, 0, 0, 0]} />
                <Bar dataKey="s3" stackId="a" fill={barColor3} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
