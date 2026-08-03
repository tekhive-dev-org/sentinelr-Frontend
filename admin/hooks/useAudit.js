import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminAuditService } from "../services/adminAuditService";
import { normalizeAuditEntry } from "../utils/auditAdapters";

export default function useAudit() {
  const router = useRouter();
  const [entries, setEntries] = useState([]); const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const page = parseInt(router.query.page, 10) || 1; const limit = parseInt(router.query.limit, 10) || 30;
  const search = router.query.search || ""; const actor = router.query.actor || "";
  const action = router.query.action || ""; const resource = router.query.resource || "";
  const outcome = router.query.outcome || ""; const dateFrom = router.query.dateFrom || ""; const dateTo = router.query.dateTo || "";

  const fetchEntries = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const params = { page, limit };
      if (search) params.search = search; if (actor) params.actor = actor; if (action) params.action = action;
      if (resource) params.resource = resource; if (outcome) params.outcome = outcome;
      if (dateFrom) params.dateFrom = dateFrom; if (dateTo) params.dateTo = dateTo;
      const res = await adminAuditService.getEntries(params);
      setEntries((res.entries || []).map(normalizeAuditEntry).filter(Boolean));
      setTotal(res.total ?? 0); setTotalPages(res.totalPages ?? 1);
    } catch (err) { setError(err.message); setEntries([]); } finally { setIsLoading(false); }
  }, [page, limit, search, actor, action, resource, outcome, dateFrom, dateTo]);

  useEffect(() => { if (router.isReady) { fetchEntries(); adminAuditService.getStats().then(setStats).catch(() => {}); } }, [router.isReady, fetchEntries]);

  const setPage = (p) => router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  const setSearch = (s) => router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  const setFilter = (k, v) => router.push({ pathname: router.pathname, query: { ...router.query, [k]: v || undefined, page: undefined } }, undefined, { shallow: true });
  const setDateFilter = (from, to) => router.push({ pathname: router.pathname, query: { ...router.query, dateFrom: from || undefined, dateTo: to || undefined, page: undefined } }, undefined, { shallow: true });

  return { entries, total, totalPages, isLoading, error, page, search, actor, action, resource, outcome, dateFrom, dateTo, stats, setPage, setSearch, setFilter, setDateFilter, retry: fetchEntries };
}
