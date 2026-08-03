import { useState, useCallback, useRef, useEffect } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PublishIcon from "@mui/icons-material/Publish";
import ArchiveIcon from "@mui/icons-material/Archive";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InboxIcon from "@mui/icons-material/Inbox";
import RefreshIcon from "@mui/icons-material/Refresh";
import styles from "./ContentTable.module.css";

const STATUS_COLORS = {
  draft: styles.statusDraft,
  scheduled: styles.statusScheduled,
  published: styles.statusPublished,
  archived: styles.statusArchived,
  expired: styles.statusExpired,
};

const SORTABLE_COLUMNS = ["title", "status", "updated"];

function SortIcon({ column, sortBy, sortOrder }) {
  if (sortBy !== column) {
    return <ArrowUpwardIcon className={styles.sortIcon} />;
  }
  return sortOrder === "asc" ? (
    <ArrowUpwardIcon className={`${styles.sortIcon} ${styles.sortIconActive}`} />
  ) : (
    <ArrowDownwardIcon className={`${styles.sortIcon} ${styles.sortIconActive}`} />
  );
}

function ActionMenu({ contentId, onEdit, onPreview, onPublish, onArchive, open, onToggle }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onToggle(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onToggle]);

  if (!open) return null;

  return (
    <div ref={menuRef} className={styles.menu} role="menu">
      <button
        type="button"
        className={styles.menuItem}
        role="menuitem"
        onClick={() => onEdit(contentId)}
      >
        <EditIcon className={styles.menuItemIcon} />
        Edit
      </button>
      <button
        type="button"
        className={styles.menuItem}
        role="menuitem"
        onClick={() => onPreview(contentId)}
      >
        <VisibilityIcon className={styles.menuItemIcon} />
        Preview
      </button>
      <button
        type="button"
        className={styles.menuItem}
        role="menuitem"
        onClick={() => onPublish(contentId)}
      >
        <PublishIcon className={styles.menuItemIcon} />
        Publish
      </button>
      <button
        type="button"
        className={styles.menuItem}
        role="menuitem"
        onClick={() => onArchive(contentId)}
      >
        <ArchiveIcon className={styles.menuItemIcon} />
        Archive
      </button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className={styles.skeletonRow}>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-44`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-20`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-16`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-16`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-24`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-24`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-8`} />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ContentTable({
  items = [],
  isLoading = false,
  error = null,
  onRetry,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onPreview,
  onPublish,
  onArchive,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleSort = useCallback(
    (column) => {
      if (!SORTABLE_COLUMNS.includes(column)) return;
      const nextOrder =
        sortBy === column && sortOrder === "asc" ? "desc" : "asc";
      onSort(column, nextOrder);
    },
    [sortBy, sortOrder, onSort],
  );

  const toggleMenu = useCallback((id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  // Error state
  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.errorWrap}>
          <ErrorOutlineIcon className={styles.errorIcon} />
          <p className={styles.errorTitle}>Failed to load content</p>
          <p className={styles.errorMessage}>{error}</p>
          {onRetry ? (
            <button type="button" className={styles.errorRetry} onClick={onRetry}>
              <RefreshIcon fontSize="small" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // Empty state (not loading and no items)
  if (!isLoading && items.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.emptyWrap}>
          <InboxIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No content found</p>
          <p className={styles.emptyMessage}>
            Create your first piece of content to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={SORTABLE_COLUMNS.includes("title") ? styles.sortableHeader : undefined}
              onClick={() => handleSort("title")}
              scope="col"
            >
              Title
              <SortIcon column="title" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th scope="col">Type</th>
            <th
              className={SORTABLE_COLUMNS.includes("status") ? styles.sortableHeader : undefined}
              onClick={() => handleSort("status")}
              scope="col"
            >
              Status
              <SortIcon column="status" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th scope="col">Audience</th>
            <th scope="col">Author</th>
            <th
              className={SORTABLE_COLUMNS.includes("updated") ? styles.sortableHeader : undefined}
              onClick={() => handleSort("updated")}
              scope="col"
            >
              Updated
              <SortIcon column="updated" sortBy={sortBy} sortOrder={sortOrder} />
            </th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className={styles.titleCell} title={item.title}>
                  {item.title}
                </td>
                <td>
                  <span className={styles.typePill}>{item.typeLabel}</span>
                </td>
                <td>
                  <span
                    className={`${styles.statusPill} ${STATUS_COLORS[item.status] || styles.statusDraft}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{item.audienceLabel}</td>
                <td>{item.author}</td>
                <td>{item.updatedAt}</td>
                <td className={styles.actionsCell}>
                  <button
                    type="button"
                    className={styles.actionsButton}
                    onClick={() => toggleMenu(item.id)}
                    aria-label={`Actions for ${item.title}`}
                    aria-expanded={openMenuId === item.id}
                  >
                    <MoreHorizIcon className={styles.actionsIcon} />
                  </button>
                  <ActionMenu
                    contentId={item.id}
                    onEdit={onEdit}
                    onPreview={onPreview}
                    onPublish={onPublish}
                    onArchive={onArchive}
                    open={openMenuId === item.id}
                    onToggle={toggleMenu}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
