import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { adminUsersService } from "../services/adminUsersService";
import { normalizeUser } from "../utils/userAdapters";

export default function useUsers() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Read query params from the URL, applying defaults
  const page = parseInt(router.query.page, 10) || 1;
  const limit = parseInt(router.query.limit, 10) || 20;
  const search = router.query.search || "";
  const role = router.query.role || "";
  const verified = router.query.verified;
  const blocked = router.query.blocked;
  const sortBy = router.query.sortBy || "";
  const sortOrder = router.query.sortOrder || "";
  const filters = {
    role: role || "all",
    verified: verified || "all",
    blocked: blocked || "all",
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (role) params.role = role;
      if (verified !== undefined) params.verified = verified;
      if (blocked !== undefined) params.blocked = blocked;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const response = await adminUsersService.getUsers(params);

      const normalized = (response.users || []).map(normalizeUser).filter(Boolean);

      setUsers(normalized);
      setTotalUsers(response.total ?? normalized.length);
      setTotalPages(response.totalPages ?? Math.ceil(normalized.length / limit));
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, role, verified, blocked, sortBy, sortOrder]);

  // Update the URL query and trigger a refetch
  const updateQuery = useCallback(
    (updates) => {
      const current = { ...router.query };
      const next = { ...current, ...updates };

      // Remove falsy/empty keys to keep the URL clean
      Object.keys(next).forEach((key) => {
        if (next[key] === "" || next[key] === undefined || next[key] === null) {
          delete next[key];
        }
      });

      router.push(
        {
          pathname: router.pathname,
          query: next,
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );

  const setPage = useCallback(
    (newPage) => {
      updateQuery({ page: newPage > 1 ? String(newPage) : undefined });
    },
    [updateQuery],
  );

  const setSearch = useCallback(
    (term) => {
      updateQuery({ search: term || undefined, page: undefined });
    },
    [updateQuery],
  );

  const setFilter = useCallback(
    (nextFilters) => {
      updateQuery({
        role: nextFilters.role && nextFilters.role !== "all" ? nextFilters.role : undefined,
        verified:
          nextFilters.verified && nextFilters.verified !== "all"
            ? nextFilters.verified
            : undefined,
        blocked:
          nextFilters.blocked && nextFilters.blocked !== "all"
            ? nextFilters.blocked
            : undefined,
        page: undefined,
      });
    },
    [updateQuery],
  );

  const setSort = useCallback(
    (field, order) => {
      updateQuery({
        sortBy: field || undefined,
        sortOrder: order || undefined,
      });
    },
    [updateQuery],
  );

  // --- Row selection ---

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids) => {
    setSelectedIds((prev) => {
      if (prev.size === ids.length && ids.every((id) => prev.has(id))) {
        return new Set();
      }
      return new Set(ids);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Derived: array of currently selected user IDs
  const selectedUserIds = Array.from(selectedIds);

  // Fetch on mount and whenever query params change
  useEffect(() => {
    if (router.isReady) {
      fetchUsers();
    }
  }, [fetchUsers, router.isReady]);

  return {
    users,
    totalUsers,
    totalPages,
    isLoading,
    error,
    selectedIds,
    selectedUserIds,
    page,
    limit,
    search,
    role,
    verified,
    blocked,
    filters,
    sortBy,
    sortOrder,
    fetchUsers,
    retry: fetchUsers,
    setPage,
    setSearch,
    setFilter,
    setSort,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  };
}
