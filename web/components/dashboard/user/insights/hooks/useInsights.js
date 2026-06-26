import { useState, useEffect } from 'react';
import { InsightsService } from '../InsightsService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function useInsights() {
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

      doc.setFontSize(18);
      doc.text("Usage Analytics Report", 14, 15);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Period: ${activePeriod.replace('_', ' ').toUpperCase()}`, 14, 22);

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
  }, [activePeriod]);

  return {
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
  };
}
