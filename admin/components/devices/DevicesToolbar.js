import { useState, useCallback, useRef, useEffect } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';
import styles from './DevicesToolbar.module.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'unpaired', label: 'Unpaired' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'stale', label: 'Stale' },
];

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'All Platforms' },
  { value: 'android', label: 'Android' },
  { value: 'ios', label: 'iOS' },
];

const PAIRING_OPTIONS = [
  { value: 'all', label: 'All Pairing' },
  { value: 'paired', label: 'Paired' },
  { value: 'unpaired', label: 'Unpaired' },
  { value: 'pending', label: 'Pending' },
];

export default function DevicesToolbar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  totalDevices,
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
            placeholder="Search devices by name or owner…"
            value={localSearch}
            onChange={handleSearchInput}
            aria-label="Search devices"
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
          <span className={styles.deviceCount}>
            Showing <strong>{totalDevices}</strong> device{totalDevices !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.platform}
          onChange={(e) => handleFilterChange('platform', e.target.value)}
          aria-label="Filter by platform"
        >
          {PLATFORM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.pairingState}
          onChange={(e) => handleFilterChange('pairingState', e.target.value)}
          aria-label="Filter by pairing state"
        >
          {PAIRING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
