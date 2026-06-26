import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import UsageChart from '../../components/dashboard/user/insights/UsageChart';
import AppsList from '../../components/dashboard/user/insights/AppsList';
import InsightFilters from '../../components/dashboard/user/insights/InsightFilters';
import styles from './insights.module.css';

import { InsightsService } from '../../components/dashboard/user/insights/InsightsService';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FullPageLoader } from '../../components/ui/loaders';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Insights() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [chartType, setChartType] = useState('graph');
  const [activePeriod, setActivePeriod] = useState('this_week');
  
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState([]);
  const [appsData, setAppsData] = useState([]);

  const totalUsage = usageData.reduce((sum, item) => sum + Number(item.usage || 0), 0);
  const averageUsage = usageData.length ? totalUsage / usageData.length : 0;
  const peakUsage = usageData.reduce((peak, item) => Math.max(peak, Number(item.usage || 0)), 0);
  const topApp = appsData?.[0]?.name || 'No app data';

  const formatHours = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (!wholeHours && !minutes) return '0m';
    return `${wholeHours ? `${wholeHours}h` : ''}${minutes ? ` ${minutes}m` : ''}`.trim();
  };

  const handleExport = (type) => {
    if (type === 'csv') {
        const headers = Object.keys(usageData[0] || {}).join(',');
        const rows = usageData.map(row => Object.values(row).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `usage_analytics_${activePeriod}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else if (type === 'pdf') {
        const doc = new jsPDF();
        const tableColumn = ["Day", "Usage (hrs)", "Social 1", "Social 2", "Social 3"];
        const tableRows = [];

        usageData.forEach(item => {
            const rowData = [
                item.day,
                item.usage,
                item.s1,
                item.s2,
                item.s3
            ];
            tableRows.push(rowData);
        });

        // Add title
        doc.setFontSize(18);
        doc.text("Usage Analytics Report", 14, 15);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Period: ${activePeriod.replace('_', ' ').toUpperCase()}`, 14, 22);

        // Generate table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [61, 9, 208], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 240, 240] }
        });

        doc.save(`usage_analytics_${activePeriod}.pdf`);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usage, apps] = await Promise.all([
                    InsightsService.getUsageAnalytics(activePeriod),
                    InsightsService.getMostUsedApps(activePeriod)
                ]);
                setUsageData(usage);
                setAppsData(apps);
            } catch (error) {
                console.error("Failed to fetch insights data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }
  }, [user, activePeriod]);

  if (authLoading) {
    return <FullPageLoader message="Loading insights…" />;
  }

  if (!user) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DashboardLayout>
        <div className={styles.page}>
          <section className={styles.hero}>
            <div>
              <span className={styles.kicker}>Usage Insights</span>
              <h1 className={styles.title}>Screen time intelligence for safer routines</h1>
              <p className={styles.subtitle}>
                Review app usage, spot screen-time patterns, and export reports for the selected period.
              </p>
            </div>
            <div className={styles.heroBadge}>
              <span>Current Period</span>
              <strong>{activePeriod.replace(/_/g, ' ')}</strong>
            </div>
          </section>

          <section className={styles.statsGrid} aria-label="Insights summary">
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Usage</span>
              <span className={styles.statValue}>{formatHours(totalUsage)}</span>
              <span className={styles.statHint}>Across selected range</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Average</span>
              <span className={styles.statValue}>{formatHours(averageUsage)}</span>
              <span className={styles.statHint}>Per data point</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Peak Day</span>
              <span className={styles.statValue}>{formatHours(peakUsage)}</span>
              <span className={styles.statHint}>Highest usage logged</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Top App</span>
              <span className={styles.statValue}>{topApp}</span>
              <span className={styles.statHint}>Most-used app sample</span>
            </div>
          </section>

          <section className={styles.contentPanel}>
            <InsightFilters
                currentChartType={chartType}
                onChartTypeChange={setChartType}
                activePeriod={activePeriod}
                onPeriodChange={setActivePeriod}
                onExport={handleExport}
            />

            <UsageChart chartType={chartType} data={usageData} loading={loading} />

            <AppsList apps={appsData} loading={loading} />
          </section>
        </div>
      </DashboardLayout>
    </LocalizationProvider>
  );
}
