import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminNotificationsService } from "../services/adminNotificationsService";
import { normalizeCampaign } from "../utils/contentAdapters";

export default function useNotifications() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const page = parseInt(router.query.page, 10) || 1;
  const limit = 20;
  const search = router.query.search || "";
  const channel = router.query.channel || "";
  const status = router.query.status || "";
  const sortBy = router.query.sortBy || "createdAt";
  const sortOrder = router.query.sortOrder || "desc";

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const params = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (channel) params.channel = channel;
      if (status) params.status = status;
      const res = await adminNotificationsService.getCampaigns(params);
      setCampaigns((res.campaigns || []).map(normalizeCampaign).filter(Boolean));
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err) { setError(err.message); setCampaigns([]); }
    finally { setIsLoading(false); }
  }, [page, search, channel, status, sortBy, sortOrder]);

  useEffect(() => { if (router.isReady) fetchCampaigns(); }, [router.isReady, fetchCampaigns]);
  const setPage = (p) => router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  const setSearch = (s) => router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  const setFilter = (k, v) => router.push({ pathname: router.pathname, query: { ...router.query, [k]: v || undefined, page: undefined } }, undefined, { shallow: true });
  const setSort = (by, order) => router.push({ pathname: router.pathname, query: { ...router.query, sortBy: by, sortOrder: order } }, undefined, { shallow: true });
  return { campaigns, total, totalPages, isLoading, error, page, search, channel, status, sortBy, sortOrder, setPage, setSearch, setFilter, setSort, retry: fetchCampaigns };
}
