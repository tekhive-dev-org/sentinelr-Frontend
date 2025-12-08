import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, BarChart, Bar } from 'recharts';
import LoadingSpinner from '../../../ui/LoadingSpinner';

export default function UsageChart({ chartType, data, loading }) {
  // Colors based on images

  // Colors based on images
  // Colors based on images
  const lineColor = '#6CAE6C'; // Greenish 
  const barColor1 = '#0f3c5f'; // Brand Navy
  const barColor2 = '#426b8e'; // Lighter Navy
  const barColor3 = '#e5e7eb'; // Gray/Light (Background)

  return (
    <div style={{ width: '100%', height: 400, background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                Avg Screen time <span style={{ color: '#1f2937' }}>7h 30m</span>
            </h3>
        </div>

      <ResponsiveContainer width="100%" height={320}>
        {loading ? (
             <LoadingSpinner />
        ) : chartType === 'graph' ? (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
             {/* Hide grid lines for clean look or use minimal */}
            {/* <CartesianGrid vertical={false} stroke="#f3f4f6" /> */}
            <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                domain={[0, 10]}
                tickCount={6}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
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
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
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
  );
}
