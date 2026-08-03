import { useState, useCallback, useRef, useEffect } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { AUDIT_ACTIONS, AUDIT_RESOURCES, AUDIT_OUTCOMES } from '../../utils/auditAdapters';
import styles from './AuditToolbar.module.css';

const ACTION_OPTIONS = [
  { value: 'all', label: 'All Actions' },
  ...AUDIT_ACTIONS.map((a) => ({ value: a, label: a })),
];

const RESOURCE_OPTIONS = [
  { value: 'all', label: 'All Resources' },
  ...AUDIT_RESOURCES.map((r) => ({
    value: r,
    label: r.charAt(0).toUpperCase() + r.slice(1),
  })),
];

const OUTCOME_OPTIONS = [
  { value: 'all', label: 'All Outcomes' },
  ...AUDIT_OUTCOMES.map((o) => ({
    value: o,
    label: o.charAt(0).toUpperCase() + o.slice(1),
  })),
];

export default function AuditToolbar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  onDateFilterChange,
  totalEntries,
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

  const handleDateChange = useCallback(
    (key, value) => {
      onDateFilterChange({ ...filters, [key]: value });
    },
    [filters, onDateFilterChange],
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
            placeholder="Search audit log…"
            value={localSearch}
            onChange={handleSearchInput}
            aria-label="Search audit entries"
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
          <span className={styles.entryCount}>
            Showing <strong>{totalEntries}</strong> {totalEntries === 1 ? 'entry' : 'entries'}
          </span>
          <button
            type="button"
            className={styles.exportBtn}
            title="Backend export required"
            aria-label="Export CSV — backend export required"
          >
            <FileDownloadOutlinedIcon className={styles.exportIcon} />
            Export CSV
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.dateRow}>
          <div className={styles.dateField}>
            <label className={styles.dateLabel} htmlFor="audit-date-from">
              From
            </label>
            <input
              id="audit-date-from"
              type="date"
              className={styles.dateInput}
              value={filters.dateFrom || ''}
              onChange={(e) => handleDateChange('dateFrom', e.target.value)}
              aria-label="Filter from date"
            />
          </div>
          <div className={styles.dateField}>
            <label className={styles.dateLabel} htmlFor="audit-date-to">
              To
            </label>
            <input
              id="audit-date-to"
              type="date"
              className={styles.dateInput}
              value={filters.dateTo || ''}
              onChange={(e) => handleDateChange('dateTo', e.target.value)}
              aria-label="Filter to date"
            />
          </div>
        </div>

        <input
          type="text"
          className={styles.filterTextInput}
          placeholder="Actor name…"
          value={filters.actor || ''}
          onChange={(e) => handleFilterChange('actor', e.target.value)}
          aria-label="Filter by actor name"
        />

        <select
          className={styles.filterSelect}
          value={filters.action || 'all'}
          onChange={(e) => handleFilterChange('action', e.target.value)}
          aria-label="Filter by action"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.resource || 'all'}
          onChange={(e) => handleFilterChange('resource', e.target.value)}
          aria-label="Filter by resource"
        >
          {RESOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.outcome || 'all'}
          onChange={(e) => handleFilterChange('outcome', e.target.value)}
          aria-label="Filter by outcome"
        >
          {OUTCOME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
