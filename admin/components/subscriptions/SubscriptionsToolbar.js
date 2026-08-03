import { useState, useCallback, useRef, useEffect } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseIcon from '@mui/icons-material/Close';
import styles from './SubscriptionsToolbar.module.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'pastDue', label: 'Past Due' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

const PLAN_OPTIONS = [
  { value: 'all', label: 'All Plans' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'personal', label: 'Personal' },
  { value: 'family', label: 'Family' },
  { value: 'premium', label: 'Premium' },
];

const BILLING_PERIOD_OPTIONS = [
  { value: 'all', label: 'All Billing' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
];

export default function SubscriptionsToolbar({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  totalSubscriptions,
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
            placeholder="Search subscriptions by subscriber or email…"
            value={localSearch}
            onChange={handleSearchInput}
            aria-label="Search subscriptions"
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
          <span className={styles.subscriptionCount}>
            Showing <strong>{totalSubscriptions}</strong> subscription{totalSubscriptions !== 1 ? 's' : ''}
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
          value={filters.plan}
          onChange={(e) => handleFilterChange('plan', e.target.value)}
          aria-label="Filter by plan"
        >
          {PLAN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.billingPeriod}
          onChange={(e) => handleFilterChange('billingPeriod', e.target.value)}
          aria-label="Filter by billing period"
        >
          {BILLING_PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
