import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard';
import UsageChart from '../../components/dashboard/user/insights/UsageChart';
import AppsList from '../../components/dashboard/user/insights/AppsList';
import InsightFilters from '../../components/dashboard/user/insights/InsightFilters';

import { InsightsService } from '../../components/dashboard/user/insights/InsightsService';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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
            headStyles: { fillColor: [15, 60, 95], textColor: [255, 255, 255] }, // Brand color
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
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DashboardLayout>

        <div style={{ padding: '0 32px 32px' }} className="dashboard-content">
          <style jsx>{`
            @media (max-width: 768px) {
              .dashboard-content {
                padding: 0 16px 16px !important;
              }
            }
          `}</style>
          
          <InsightFilters 
              currentChartType={chartType} 
              onChartTypeChange={setChartType}
              activePeriod={activePeriod}
              onPeriodChange={setActivePeriod}
              onExport={handleExport}
          />

          <UsageChart chartType={chartType} data={usageData} loading={loading} />
          
          <AppsList apps={appsData} loading={loading} />
        </div>
      </DashboardLayout>
    </LocalizationProvider>
  );
}
