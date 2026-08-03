import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminTeamService } from "../services/adminTeamService";
import { normalizeAdmin } from "../utils/teamAdapters";

export default function useTeam() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]); const [total, setTotal] = useState(0); const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState(null);
  const page = parseInt(router.query.page, 10) || 1; const limit = 20;
  const search = router.query.search || ""; const role = router.query.role || ""; const status = router.query.status || "";

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const params = { page, limit }; if (search) params.search = search; if (role) params.role = role; if (status) params.status = status;
      const res = await adminTeamService.getAdmins(params);
      setAdmins((res.admins || []).map(normalizeAdmin).filter(Boolean));
      setTotal(res.total ?? 0); setTotalPages(res.totalPages ?? 1);
    } catch (err) { setError(err.message); setAdmins([]); } finally { setIsLoading(false); }
  }, [page, search, role, status]);

  useEffect(() => { if (router.isReady) fetchAdmins(); }, [router.isReady, fetchAdmins]);
  const setPage = (p) => router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  const setSearch = (s) => router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  const setFilter = (k, v) => router.push({ pathname: router.pathname, query: { ...router.query, [k]: v || undefined, page: undefined } }, undefined, { shallow: true });
  return { admins, total, totalPages, isLoading, error, page, search, role, status, setPage, setSearch, setFilter, retry: fetchAdmins };
}
