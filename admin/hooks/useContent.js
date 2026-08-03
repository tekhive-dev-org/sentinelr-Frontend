import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminContentService } from "../services/adminContentService";
import { normalizeContent } from "../utils/contentAdapters";

export default function useContent() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const page = parseInt(router.query.page, 10) || 1;
  const limit = 20;
  const search = router.query.search || "";
  const type = router.query.type || "";
  const status = router.query.status || "";
  const audience = router.query.audience || "";
  const sortBy = router.query.sortBy || "updatedAt";
  const sortOrder = router.query.sortOrder || "desc";

  const fetchItems = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const params = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (type) params.type = type;
      if (status) params.status = status;
      if (audience) params.audience = audience;
      const res = await adminContentService.getItems(params);
      setItems((res.items || []).map(normalizeContent).filter(Boolean));
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (err) { setError(err.message); setItems([]); }
    finally { setIsLoading(false); }
  }, [page, search, type, status, audience, sortBy, sortOrder]);

  useEffect(() => { if (router.isReady) fetchItems(); }, [router.isReady, fetchItems]);
  const setPage = (p) => router.push({ pathname: router.pathname, query: { ...router.query, page: p } }, undefined, { shallow: true });
  const setSearch = (s) => router.push({ pathname: router.pathname, query: { ...router.query, search: s || undefined, page: undefined } }, undefined, { shallow: true });
  const setFilter = (k, v) => router.push({ pathname: router.pathname, query: { ...router.query, [k]: v || undefined, page: undefined } }, undefined, { shallow: true });
  const setSort = (by, order) => router.push({ pathname: router.pathname, query: { ...router.query, sortBy: by, sortOrder: order } }, undefined, { shallow: true });
  return { items, total, totalPages, isLoading, error, page, search, type, status, audience, sortBy, sortOrder, setPage, setSearch, setFilter, setSort, retry: fetchItems };
}
