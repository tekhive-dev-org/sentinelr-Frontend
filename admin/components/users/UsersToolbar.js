import { useState, useCallback, useRef, useEffect } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import styles from './UsersToolbar.module.css';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
];

const VERIFICATION_OPTIONS = [
  { value: 'all', label: 'All Verification' },
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'suspended', label: 'Suspended' },
];

export default function UsersToolbar({
  search,
  onSearchChange,
  filters = {},
  onFilterChange,
  selectedCount,
  onExport,
  totalUsers,
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLocalSearch(search);
  }, [search]);

  const handleSearchInput = useCallback(
    (e) => {
      const value = e.target.value;
      setLocalSearch(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    },
    [onSearchChange],
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    onSearchChange('');
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, [onSearchChange]);

  const handleFilterChange = useCallback(
    (key, value) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.toolbar}>
      <div className={styles.topRow}>
        <div className={styles.searchWrap}>
          <SearchOutlinedIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search users by name or email…"
            value={localSearch}
            onChange={handleSearchInput}
            aria-label="Search users"
          />
          {localSearch && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <CloseIcon className={styles.clearIcon} />
            </button>
          )}
        </div>

        <div className={styles.rightSection}>
          <span className={styles.userCount}>
            Showing <strong>{totalUsers}</strong> user{totalUsers !== 1 ? 's' : ''}
          </span>

          {selectedCount > 0 && (
            <button
              type="button"
              className={styles.exportBtn}
              onClick={onExport}
            >
              <FileDownloadOutlinedIcon className={styles.exportIcon} />
              Export {selectedCount} selected
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filters.role || 'all'}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          aria-label="Filter by role"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.verified || 'all'}
          onChange={(e) => handleFilterChange('verified', e.target.value)}
          aria-label="Filter by verification status"
        >
          {VERIFICATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.blocked || 'all'}
          onChange={(e) => handleFilterChange('blocked', e.target.value)}
          aria-label="Filter by account status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
