import { useState, useCallback, useMemo } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import styles from './UsersTable.module.css';

const STATUS_COLORS = {
  active: 'green',
  blocked: 'red',
  flagged: 'yellow',
  suspended: 'orange',
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatLastActive(dateStr) {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const SORTABLE_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'lastActive', label: 'Last Active' },
];

function SkeletonRow() {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <div className={styles.skeleton} style={{ width: 16, height: 16 }} />
      </td>
      <td className={styles.cell}>
        <div className={styles.nameCell}>
          <div className={styles.skeleton} style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div>
            <div className={styles.skeleton} style={{ width: 100, height: 14, marginBottom: 4 }} />
            <div className={styles.skeleton} style={{ width: 60, height: 10 }} />
          </div>
        </div>
      </td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 140, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 100, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 60, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 60, height: 12 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 24, height: 24 }} /></td>
    </tr>
  );
}

function ActionMenu({ userId, userStatus, onViewDetails, onToggleBlock, onVerify }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback((e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  }, []);

  const handleAction = useCallback(
    (action) => (e) => {
      e.stopPropagation();
      setAnchorEl(null);
      action(userId);
    },
    [userId],
  );

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        aria-label={`Actions for user ${userId}`}
        className={styles.menuBtn}
      >
        <MoreVertIcon className={styles.menuIcon} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 0.5,
            borderRadius: '12px',
            border: '1px solid rgba(224, 111, 41, 0.12)',
            boxShadow: '0 10px 25px rgba(18, 6, 30, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            '& .MuiMenuItem-root': {
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#334155',
              padding: '8px 16px',
              borderRadius: '8px',
              margin: '2px 6px',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: 'rgba(224, 111, 41, 0.08)',
                color: '#e06f29',
              },
              '& .MuiListItemIcon-root': {
                minWidth: '28px',
                color: 'inherit',
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleAction(onViewDetails)}>
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAction(onToggleBlock)}>
          <ListItemIcon>
            {userStatus === 'blocked' ? (
              <LockOpenOutlinedIcon fontSize="small" />
            ) : (
              <BlockOutlinedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {userStatus === 'blocked' ? 'Unblock' : 'Block'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAction(onVerify)}>
          <ListItemIcon>
            <CheckCircleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Verify</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default function UsersTable({
  users,
  isLoading,
  error,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortBy,
  sortOrder,
  onUserClick,
}) {
  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const someSelected = users.some((u) => selectedIds.has(u.id)) && !allSelected;

  const handleSort = useCallback(
    (key) => {
      onSort(key);
    },
    [onSort],
  );

  const handleRowClick = useCallback(
    (user) => {
      onUserClick(user);
    },
    [onUserClick],
  );

  const handleCheckboxClick = useCallback(
    (e, userId) => {
      e.stopPropagation();
      onToggleSelect(userId);
    },
    [onToggleSelect],
  );

  const handleSelectAll = useCallback(
    (e) => {
      e.stopPropagation();
      onToggleSelectAll(users.map((user) => user.id));
    },
    [onToggleSelectAll, users],
  );

  const actionCallbacks = useMemo(
    () => ({
      onViewDetails: (id) => onUserClick(users.find((u) => u.id === id)),
      onToggleBlock: (id) => {
        const user = users.find((u) => u.id === id);
        if (user) onUserClick({ ...user, action: user.status === 'blocked' ? 'unblock' : 'block' });
      },
      onVerify: (id) => {
        const user = users.find((u) => u.id === id);
        if (user) onUserClick({ ...user, action: 'verify' });
      },
    }),
    [users, onUserClick],
  );

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.errorBanner} role="alert">
          <ErrorOutlineIcon className={styles.errorIcon} />
          <span className={styles.errorText}>{error}</span>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            <ReplayIcon className={styles.retryIcon} />
            Retry
          </button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.checkCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all users"
                />
              </th>
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={styles.headerCell}
                  onClick={() => handleSort(col.key)}
                  role="columnheader"
                  aria-sort={
                    sortBy === col.key
                      ? sortOrder === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <span className={styles.headerContent}>
                    {col.label}
                    {sortBy === col.key && (
                      <span className={styles.sortIcon}>
                        {sortOrder === 'asc' ? (
                          <ArrowUpwardIcon className={styles.sortArrow} />
                        ) : (
                          <ArrowDownwardIcon className={styles.sortArrow} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              <th className={styles.headerCell}>
                <span className={styles.srOnly}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />)}

            {!isLoading && !error && users.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <SearchOffIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>No users match your filters</p>
                    <p className={styles.emptyDesc}>
                      Try adjusting your search criteria or clearing the filters above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              users.map((user) => {
                const isSelected = selectedIds.has(user.id);
                const statusKey = user.statusType || String(user.status || '').toLowerCase();
                const statusColor = STATUS_COLORS[statusKey] || 'green';

                return (
                  <tr
                    key={user.id}
                    className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
                    onClick={() => handleRowClick(user)}
                    role="row"
                  >
                    <td className={styles.cell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isSelected}
                        onChange={(e) => handleCheckboxClick(e, user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </td>
                    <td className={styles.cell}>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>{getInitials(user.name)}</div>
                        <span className={styles.userName}>{user.name}</span>
                      </div>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.emailText}>{user.email}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.phoneText}>{user.phone || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.roleText}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${statusColor.charAt(0).toUpperCase() + statusColor.slice(1)}`]
                        }`}
                      >
                        {user.status
                          ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                          : 'Unknown'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.lastActive}>{formatLastActive(user.lastActive)}</span>
                    </td>
                    <td className={styles.cell}>
                      <ActionMenu
                        userId={user.id}
                        userStatus={statusKey}
                        onViewDetails={actionCallbacks.onViewDetails}
                        onToggleBlock={actionCallbacks.onToggleBlock}
                        onVerify={actionCallbacks.onVerify}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
