import React from 'react';
import styles from './InsightsDashboard.module.css';
import UsageChart from './UsageChart';
import AppsList from './AppsList';
import InsightFilters from './InsightFilters';
import { useInsights } from './hooks/useInsights';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function InsightsDashboard() {
  const {
    chartType,
    setChartType,
    activePeriod,
    setActivePeriod,
    loading,
    usageData,
    appsData,
    totalUsage,
    averageUsage,
    peakUsage,
    topApp,
    formatHours,
    handleExport,
  } = useInsights();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
    </LocalizationProvider>
  );
}
