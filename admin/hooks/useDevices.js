import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminDevicesService } from "../services/adminDevicesService";
import { normalizeDevice } from "../utils/deviceAdapters";

export default function useDevices() {
  const router = useRouter();

  const [devices, setDevices] = useState([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const page = parseInt(router.query.page, 10) || 1;
  const limit = parseInt(router.query.limit, 10) || 20;
  const search = router.query.search || "";
  const status = router.query.status || "";
  const platform = router.query.platform || "";
  const pairingState = router.query.pairingState || "";
  const sortBy = router.query.sortBy || "";
  const sortOrder = router.query.sortOrder || "";

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (platform) params.platform = platform;
      if (pairingState) params.pairingState = pairingState;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const response = await adminDevicesService.getDevices(params);
      const normalized = (response.devices || []).map(normalizeDevice).filter(Boolean);
      setDevices(normalized);
      setTotalDevices(response.total ?? normalized.length);
      setTotalPages(response.totalPages ?? Math.ceil(normalized.length / limit));
    } catch (err) {
      setError(err.message || "Failed to fetch devices");
      setDevices([]);
      setTotalDevices(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, status, platform, pairingState, sortBy, sortOrder]);

  useEffect(() => {
    if (router.isReady) fetchDevices();
  }, [router.isReady, fetchDevices]);

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

  const retry = useCallback(() => fetchDevices(), [fetchDevices]);

  return {
    devices, totalDevices, totalPages, isLoading, error,
    page, search, status, platform, pairingState, sortBy, sortOrder,
    setPage, setSearch, setFilter, setSort, retry,
  };
}
