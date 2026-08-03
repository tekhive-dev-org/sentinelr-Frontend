import { useState, useCallback, useRef, useEffect } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';
import styles from './AlertsToolbar.module.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'falseAlarm', label: 'False Alarm' },
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All Severity' },
  { value: 'critical', label: 'Critical' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'user', label: 'User' },
  { value: 'deviceAgent', label: 'Device Agent' },
  { value: 'geofence', label: 'Geofence' },
];

export default function AlertsToolbar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  totalAlerts,
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
            placeholder="Search incidents by code, user, or device…"
            value={localSearch}
            onChange={handleSearchInput}
            aria-label="Search alerts"
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
          <span className={styles.alertCount}>
            Showing <strong>{totalAlerts}</strong> incident{totalAlerts !== 1 ? 's' : ''}
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
          value={filters.severity}
          onChange={(e) => handleFilterChange('severity', e.target.value)}
          aria-label="Filter by severity"
        >
          {SEVERITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.source}
          onChange={(e) => handleFilterChange('source', e.target.value)}
          aria-label="Filter by source"
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
