import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { CONTENT_TYPES } from "../../utils/contentAdapters";
import styles from "./ContentToolbar.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
  { value: "expired", label: "Expired" },
];

const AUDIENCE_OPTIONS = [
  { value: "", label: "All audiences" },
  { value: "all", label: "All users" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "guardian", label: "Guardian" },
  { value: "educator", label: "Educator" },
];

export default function ContentToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  audienceFilter,
  onAudienceFilterChange,
  onNewContent,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search content…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search content"
          />
        </div>

        <select
          className={styles.select}
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          aria-label="Filter by content type"
        >
          <option value="">All types</option>
          {CONTENT_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={audienceFilter}
          onChange={(e) => onAudienceFilterChange(e.target.value)}
          aria-label="Filter by audience"
        >
          {AUDIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.newButton}
          onClick={onNewContent}
        >
          <AddIcon className={styles.newButtonIcon} />
          New Content
        </button>
      </div>
    </div>
  );
}
