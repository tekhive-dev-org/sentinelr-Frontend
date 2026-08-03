import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { adminAlertsService } from "../services/adminAlertsService";
import { normalizeAlert } from "../utils/alertAdapters";

const POLL_INTERVAL_MS = 15000;

export default function useAlerts() {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCount, setActiveCount] = useState(0);
  const pollRef = useRef(null);

  const page = parseInt(router.query.page, 10) || 1;
  const limit = parseInt(router.query.limit, 10) || 20;
  const search = router.query.search || "";
  const status = router.query.status || "";
  const severity = router.query.severity || "";
  const source = router.query.source || "";
  const sortBy = router.query.sortBy || "createdAt";
  const sortOrder = router.query.sortOrder || "desc";

  const fetchAlerts = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (status) params.status = status;
      if (severity) params.severity = severity;
      if (source) params.source = source;
      const response = await adminAlertsService.getAlerts(params);
      const normalized = (response.alerts || []).map(normalizeAlert).filter(Boolean);
      setAlerts(normalized);
      setTotalAlerts(response.total ?? normalized.length);
      setTotalPages(response.totalPages ?? Math.ceil(normalized.length / limit));
    } catch (err) {
      if (!silent) {
        setError(err.message || "Failed to fetch alerts");
        setAlerts([]);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, limit, search, status, severity, source, sortBy, sortOrder]);

  const fetchActiveCount = useCallback(async () => {
    try {
      const count = await adminAlertsService.getActiveCount();
      setActiveCount(count);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      fetchAlerts();
      fetchActiveCount();
    }
  }, [router.isReady, fetchAlerts, fetchActiveCount]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchAlerts(true);
      fetchActiveCount();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchAlerts, fetchActiveCount]);

  const setPage = useCallback((p) => {
    router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  }, [router]);
  const setSearch = useCallback((s) => {
    router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  }, [router]);
  const setFilter = useCallback((key, value) => {
    router.push({ pathname: router.pathname, query: { ...router.query, [key]: value || undefined, page: undefined } }, undefined, { shallow: true });
  }, [router]);
  const setSort = useCallback((by, order) => {
    router.push({ pathname: router.pathname, query: { ...router.query, sortBy: by, sortOrder: order, page: undefined } }, undefined, { shallow: true });
  }, [router]);
  const retry = useCallback(() => fetchAlerts(), [fetchAlerts]);

  return {
    alerts, totalAlerts, totalPages, isLoading, error, activeCount,
    page, search, status, severity, source, sortBy, sortOrder,
    setPage, setSearch, setFilter, setSort, retry,
  };
}
