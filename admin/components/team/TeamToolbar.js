import SearchIcon from '@mui/icons-material/Search';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { ROLE_OPTIONS } from '../../utils/teamAdapters';
import styles from './TeamToolbar.module.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'deactivated', label: 'Deactivated' },
];

export default function TeamToolbar({ search, onSearchChange, filters, onFilterChange }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <SearchIcon className={styles.searchIcon} fontSize="small" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search admins..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <select
          className={styles.filterSelect}
          value={filters?.role || ''}
          onChange={(e) => onFilterChange({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters?.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button className={styles.inviteButton} type="button">
          <PersonAddOutlinedIcon className={styles.inviteIcon} />
          Invite Admin
        </button>
      </div>
    </div>
  );
}
