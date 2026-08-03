// MOCK-POWERED — Replace with real API when available
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminGeofencingService } from "../services/adminGeofencingService";

export default function useGeofencing() {
  const router = useRouter();
  const [zones, setZones] = useState([]); const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(null);
  const [stats, setStats] = useState(null); const [events, setEvents] = useState([]);
  const page = parseInt(router.query.page, 10) || 1; const limit = 20;
  const search = router.query.search || ""; const type = router.query.type || ""; const status = router.query.status || "";

  const fetchZones = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const res = await adminGeofencingService.getZones({ page, limit, search, type, status }); setZones(res.zones); setTotal(res.total); setTotalPages(res.totalPages); }
    catch (err) { setError(err.message); setZones([]); } finally { setIsLoading(false); }
  }, [page, search, type, status]);
  useEffect(() => { if (router.isReady) { fetchZones(); adminGeofencingService.getStats().then(setStats).catch(() => {}); adminGeofencingService.getEvents({ limit: 10 }).then(e => setEvents(e.events || [])).catch(() => {}); } }, [router.isReady, fetchZones]);

  const setPage = (p) => router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  const setSearch = (s) => router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  const setFilter = (k, v) => router.push({ pathname: router.pathname, query: { ...router.query, [k]: v || undefined, page: undefined } }, undefined, { shallow: true });
  return { zones, total, totalPages, isLoading, error, page, search, type, status, stats, events, setPage, setSearch, setFilter, retry: fetchZones };
}
