import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminSubscriptionsService } from "../services/adminSubscriptionsService";
import { normalizeSubscription } from "../utils/subscriptionAdapters";

export default function useSubscriptions() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const page = parseInt(router.query.page, 10) || 1;
  const limit = parseInt(router.query.limit, 10) || 20;
  const search = router.query.search || "";
  const status = router.query.status || "";
  const plan = router.query.plan || "";
  const billingPeriod = router.query.billingPeriod || "";
  const sortBy = router.query.sortBy || "";
  const sortOrder = router.query.sortOrder || "";

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (plan) params.plan = plan;
      if (billingPeriod) params.billingPeriod = billingPeriod;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      const response = await adminSubscriptionsService.getSubscriptions(params);
      const normalized = (response.subscriptions || []).map(normalizeSubscription).filter(Boolean);
      setSubscriptions(normalized);
      setTotalSubscriptions(response.total ?? normalized.length);
      setTotalPages(response.totalPages ?? Math.ceil(normalized.length / limit));
    } catch (err) {
      setError(err.message || "Failed to fetch subscriptions");
      setSubscriptions([]);
    } finally { setIsLoading(false); }
  }, [page, limit, search, status, plan, billingPeriod, sortBy, sortOrder]);

  useEffect(() => { if (router.isReady) fetchSubscriptions(); }, [router.isReady, fetchSubscriptions]);

  const setPage = (p) => router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  const setSearch = (s) => router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  const setFilter = (key, value) => router.push({ pathname: router.pathname, query: { ...router.query, [key]: value || undefined, page: undefined } }, undefined, { shallow: true });
  const setSort = (by, order) => router.push({ pathname: router.pathname, query: { ...router.query, sortBy: by, sortOrder: order, page: undefined } }, undefined, { shallow: true });
  const retry = () => fetchSubscriptions();

  return {
    subscriptions, totalSubscriptions, totalPages, isLoading, error,
    page, search, status, plan, billingPeriod, sortBy, sortOrder,
    setPage, setSearch, setFilter, setSort, retry,
  };
}
