// MOCK-POWERED — Replace with real API when available
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminSupportService } from "../services/adminSupportService";

export default function useSupport() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]); const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(null);
  const [stats, setStats] = useState(null); const [feedback, setFeedback] = useState([]);
  const page = parseInt(router.query.page, 10) || 1; const limit = 20;
  const search = router.query.search || ""; const status = router.query.status || ""; const category = router.query.category || "";
  const priority = router.query.priority || "";

  const fetchTickets = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const res = await adminSupportService.getTickets({ page, limit, search, status, category, priority }); setTickets(res.tickets); setTotal(res.total); setTotalPages(res.totalPages); }
    catch (err) { setError(err.message); setTickets([]); } finally { setIsLoading(false); }
  }, [page, search, status, category, priority]);
  useEffect(() => { if (router.isReady) { fetchTickets(); adminSupportService.getStats().then(setStats).catch(() => {}); adminSupportService.getFeedback({ limit: 10 }).then(f => setFeedback(f.feedback || [])).catch(() => {}); } }, [router.isReady, fetchTickets]);

  const setPage = (p) => router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  const setSearch = (s) => router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  const setFilter = (k, v) => router.push({ pathname: router.pathname, query: { ...router.query, [k]: v || undefined, page: undefined } }, undefined, { shallow: true });
  return { tickets, total, totalPages, isLoading, error, page, search, status, category, priority, stats, feedback, setPage, setSearch, setFilter, retry: fetchTickets };
}
