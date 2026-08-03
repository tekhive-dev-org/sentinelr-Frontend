import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { adminAnalyticsService } from "../services/adminAnalyticsService";

const DEFAULT_RANGE = "30d";

export default function useAnalytics() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({});
  const [metricErrors, setMetricErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState(null);

  const range = router.query.range || DEFAULT_RANGE;
  const filters = useMemo(() => ({
    plan: router.query.plan || "",
    platform: router.query.platform || "",
    country: router.query.country || "",
    accountType: router.query.accountType || "",
  }), [router.query.plan, router.query.platform, router.query.country, router.query.accountType]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const categories = ["user-growth", "active-users", "device-adoption", "family-growth", "sos-trends", "geofence-activity", "parental-adoption", "subscription-metrics", "app-versions", "platform-health"];
    const errors = {};
    const results = {};

    const promises = categories.map(async (cat) => {
      const methodName = `get${cat.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
      try {
        const fn = adminAnalyticsService[methodName] || adminAnalyticsService.getOverview;
        const data = await fn(range, filters);
        results[cat] = data;
      } catch (err) {
        errors[cat] = err.message || "Failed to load";
        results[cat] = null;
      }
    });

    try {
      const overviewData = await adminAnalyticsService.getOverview(range, filters);
      setOverview(overviewData);
    } catch { setOverview(null); }

    await Promise.allSettled(promises);
    setMetrics(results);
    setMetricErrors(errors);
    setIsLoading(false);
  }, [range, filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchSingle = useCallback(async (category) => {
    const methodName = `get${category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}`;
    try {
      const fn = adminAnalyticsService[methodName] || adminAnalyticsService.getOverview;
      const data = await fn(range, filters);
      setMetrics(prev => ({ ...prev, [category]: data }));
      setMetricErrors(prev => { const n = { ...prev }; delete n[category]; return n; });
    } catch (err) {
      setMetricErrors(prev => ({ ...prev, [category]: err.message }));
    }
  }, [range, filters]);

  const setRange = useCallback((r) => {
    router.push({ pathname: router.pathname, query: { ...router.query, range: r } }, undefined, { shallow: true });
  }, [router]);

  const setFilter = useCallback((key, value) => {
    router.push({ pathname: router.pathname, query: { ...router.query, [key]: value || undefined } }, undefined, { shallow: true });
  }, [router]);

  const exportData = useCallback(async (category, format) => {
    const fn = format === "csv" ? adminAnalyticsService.exportCSV : adminAnalyticsService.exportPDF;
    return fn(category, range, filters);
  }, [range, filters]);

  return {
    metrics, metricErrors, isLoading, overview,
    range, filters, setRange, setFilter, fetchSingle, exportData,
  };
}
