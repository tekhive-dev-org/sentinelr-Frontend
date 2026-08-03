// MOCK-POWERED — Replace with real API when available
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminParentalService } from "../services/adminParentalService";

export default function useParental() {
  const router = useRouter();
  const [families, setFamilies] = useState([]); const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(null);
  const [stats, setStats] = useState(null); const [activity, setActivity] = useState([]);
  const page = parseInt(router.query.page, 10) || 1; const limit = 20;
  const search = router.query.search || ""; const monitoring = router.query.monitoring || "";

  const fetchFamilies = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const res = await adminParentalService.getFamilies({ page, limit, search, monitoring }); setFamilies(res.families); setTotal(res.total); setTotalPages(res.totalPages); }
    catch (err) { setError(err.message); setFamilies([]); } finally { setIsLoading(false); }
  }, [page, search, monitoring]);
  useEffect(() => { if (router.isReady) { fetchFamilies(); adminParentalService.getStats().then(setStats).catch(() => {}); adminParentalService.getActivity({ limit: 10 }).then(a => setActivity(a.activities || [])).catch(() => {}); } }, [router.isReady, fetchFamilies]);

  const setPage = (p) => router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  const setSearch = (s) => router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  const setFilter = (k, v) => router.push({ pathname: router.pathname, query: { ...router.query, [k]: v || undefined, page: undefined } }, undefined, { shallow: true });
  return { families, total, totalPages, isLoading, error, page, search, monitoring, stats, activity, setPage, setSearch, setFilter, retry: fetchFamilies };
}
