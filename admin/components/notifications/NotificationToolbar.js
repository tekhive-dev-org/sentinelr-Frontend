import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import styles from "./NotificationToolbar.module.css";

const CHANNEL_OPTIONS = [
  { value: "", label: "All channels" },
  { value: "in_app", label: "In-App" },
  { value: "push", label: "Push" },
  { value: "email", label: "Email" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
];

export default function NotificationToolbar({
  search,
  onSearchChange,
  channelFilter,
  onChannelFilterChange,
  statusFilter,
  onStatusFilterChange,
  onNewCampaign,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search campaigns…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search campaigns"
          />
        </div>

        <select
          className={styles.select}
          value={channelFilter}
          onChange={(e) => onChannelFilterChange(e.target.value)}
          aria-label="Filter by channel"
        >
          {CHANNEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.newButton}
          onClick={onNewCampaign}
        >
          <AddIcon className={styles.newButtonIcon} />
          New Campaign
        </button>
      </div>
    </div>
  );
}
