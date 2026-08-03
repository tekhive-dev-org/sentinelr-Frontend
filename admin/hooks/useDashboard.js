import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../services/dashboardService";

const sortErrors = (errors) =>
  Object.entries(errors || {})
    .filter(([, err]) => err)
    .sort((a, b) => {
      if (String(a[1]) === "unauthenticated") return -1;
      if (String(b[1]) === "unauthenticated") return 1;
      return 0;
    });

export default function useDashboard() {
  const [stats, setStats] = useState({
    total: null,
    blocked: null,
    verified: null,
    activeSOS: null,
    flagged: null,
  });
  const [trends, setTrends] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [widgetErrors, setWidgetErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRangeState] = useState("7d");
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);

    const [overview, userStats, trendsData, recent] = await Promise.all([
      dashboardService.getOverview(),
      dashboardService.getUserStats(),
      dashboardService.getTrends(),
      dashboardService.getRecentUsers(),
    ]);

    // Build stats from overview + userStats
    setStats({
      total: userStats.total ?? overview.allUsers ?? null,
      blocked: overview.blockedUsers ?? null,
      verified: overview.verifiedUsers ?? null,
      activeSOS: overview.activeSOSIncidents ?? null,
      flagged: userStats.flagged ?? null,
    });

    setTrends(trendsData || {});
    setRecentUsers(recent.users ?? []);

    // Collect per-widget errors
    const errors = {};

    if (overview.errors) {
      const sorted = sortErrors(overview.errors);
      if (sorted.length) errors.overview = sorted[0][1];
    }

    if (userStats.errors) {
      const sorted = sortErrors(userStats.errors);
      if (sorted.length) errors.userStats = sorted[0][1];
    }

    if (recent.error) {
      errors.recentUsers = recent.error;
    }

    if (trendsData) {
      let hasTrendError = false;
      for (const key of Object.keys(trendsData)) {
        if (trendsData[key]?.error) {
          errors[key] = trendsData[key].error;
          hasTrendError = true;
        }
      }
      if (hasTrendError) errors.trends = "One or more trend metrics are unavailable";
    }

    setWidgetErrors(errors);
    setIsLoading(false);
    setLastRefreshed(new Date());
  }, []);

  const refreshWidget = useCallback(
    async (widgetKey) => {
      setWidgetErrors((prev) => {
        const next = { ...prev };
        delete next[widgetKey];
        return next;
      });

      setIsLoading(true);

      try {
        switch (widgetKey) {
          case "overview": {
            const overview = await dashboardService.getOverview();
            setStats((prev) => ({
              ...prev,
              blocked: overview.blockedUsers ?? prev.blocked,
              verified: overview.verifiedUsers ?? prev.verified,
              activeSOS: overview.activeSOSIncidents ?? prev.activeSOS,
            }));
            if (overview.errors) {
              const sorted = sortErrors(overview.errors);
              if (sorted.length) {
                setWidgetErrors((prev) => ({ ...prev, overview: sorted[0][1] }));
              }
            }
            break;
          }
          case "userStats": {
            const userStats = await dashboardService.getUserStats();
            setStats((prev) => ({
              ...prev,
              total: userStats.total ?? prev.total,
              flagged: userStats.flagged ?? prev.flagged,
            }));
            if (userStats.errors) {
              const sorted = sortErrors(userStats.errors);
              if (sorted.length) {
                setWidgetErrors((prev) => ({ ...prev, userStats: sorted[0][1] }));
              }
            }
            break;
          }
          case "recentUsers": {
            const recent = await dashboardService.getRecentUsers();
            if (recent.users) {
              setRecentUsers(recent.users);
            }
            if (recent.error) {
              setWidgetErrors((prev) => ({ ...prev, recentUsers: recent.error }));
            }
            break;
          }
          case "trends": {
            const trendsData = await dashboardService.getTrends();
            setTrends(trendsData || {});
            if (trendsData) {
              const errs = {};
              for (const key of Object.keys(trendsData)) {
                if (trendsData[key]?.error) errs[key] = trendsData[key].error;
              }
              setWidgetErrors((prev) => {
                const next = { ...prev };
                for (const k of Object.keys(trendsData)) delete next[k];
                if (Object.keys(errs).length) next.trends = "One or more trend metrics are unavailable";
                return next;
              });
            }
            break;
          }
          default:
            // Re-fetch everything for unknown widgets
            await fetchDashboard();
            return;
        }
      } catch (error) {
        setWidgetErrors((prev) => ({ ...prev, [widgetKey]: error.message || "Refresh failed" }));
      } finally {
        setIsLoading(false);
        setLastRefreshed(new Date());
      }
    },
    [fetchDashboard],
  );

  const setDateRange = useCallback(
    (range) => {
      setDateRangeState(range);
      // Re-fetch trends when date range changes
      dashboardService.getTrends().then((trendsData) => {
        setTrends(trendsData || {});
        if (trendsData) {
          const errs = {};
          for (const key of Object.keys(trendsData)) {
            if (trendsData[key]?.error) errs[key] = trendsData[key].error;
          }
          setWidgetErrors((prev) => {
            const next = { ...prev };
            for (const k of Object.keys(trendsData)) delete next[k];
            if (Object.keys(errs).length) next.trends = "One or more trend metrics are unavailable";
            return next;
          });
        }
      });
    },
    [],
  );

  const refreshAll = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    trends,
    recentUsers,
    widgetErrors,
    isLoading,
    dateRange,
    setDateRange,
    refreshWidget,
    refreshAll,
    lastRefreshed,
  };
}
