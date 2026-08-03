import { useState, useCallback, useRef, useEffect } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CancelIcon from "@mui/icons-material/Cancel";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CampaignIcon from "@mui/icons-material/Campaign";
import RefreshIcon from "@mui/icons-material/Refresh";
import styles from "./NotificationTable.module.css";

const CHANNEL_COLORS = {
  in_app: styles.channelInApp,
  push: styles.channelPush,
  email: styles.channelEmail,
};

const STATUS_COLORS = {
  draft: styles.statusDraft,
  scheduled: styles.statusScheduled,
  sent: styles.statusSent,
  failed: styles.statusFailed,
};

function ActionMenu({ campaignId, onEdit, onSend, onSchedule, onCancel, open, onToggle }) {
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
        onClick={() => onEdit(campaignId)}
      >
        <EditIcon className={styles.menuItemIcon} />
        Edit
      </button>
      <button
        type="button"
        className={styles.menuItem}
        role="menuitem"
        onClick={() => onSchedule(campaignId)}
      >
        <ScheduleIcon className={styles.menuItemIcon} />
        Schedule
      </button>
      <button
        type="button"
        className={styles.menuItem}
        role="menuitem"
        onClick={() => onSend(campaignId)}
      >
        <SendIcon className={styles.menuItemIcon} />
        Send
      </button>
      <button
        type="button"
        className={styles.menuItem}
        role="menuitem"
        onClick={() => onCancel(campaignId)}
      >
        <CancelIcon className={styles.menuItemIcon} />
        Cancel
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
            <div className={`${styles.skeletonLine} w-40`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-16`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-14`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-16`} />
          </td>
          <td className={styles.skeletonCell}>
            <div className={`${styles.skeletonLine} w-28`} />
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

export default function NotificationTable({
  campaigns = [],
  isLoading = false,
  error = null,
  onRetry,
  onEdit,
  onSend,
  onSchedule,
  onCancel,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = useCallback((id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  }, []);

  // Error state
  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.errorWrap}>
          <ErrorOutlineIcon className={styles.errorIcon} />
          <p className={styles.errorTitle}>Failed to load campaigns</p>
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

  // Empty state
  if (!isLoading && campaigns.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.emptyWrap}>
          <CampaignIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No campaigns found</p>
          <p className={styles.emptyMessage}>
            Create a notification campaign to reach your users.
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
            <th scope="col">Title</th>
            <th scope="col">Channel</th>
            <th scope="col">Status</th>
            <th scope="col">Audience</th>
            <th scope="col">Delivery</th>
            <th scope="col">Date</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : (
            campaigns.map((c) => (
              <tr key={c.id}>
                <td className={styles.titleCell} title={c.title}>
                  {c.title}
                </td>
                <td>
                  <span
                    className={`${styles.channelPill} ${CHANNEL_COLORS[c.channel] || styles.channelInApp}`}
                  >
                    {c.channelLabel}
                  </span>
                </td>
                <td>
                  <span
                    className={`${styles.statusPill} ${STATUS_COLORS[c.status] || styles.statusDraft}`}
                  >
                    {c.statusLabel || c.status}
                  </span>
                </td>
                <td>{c.audienceLabel}</td>
                <td>
                  <span className={styles.deliveryStats}>
                    <span className={styles.deliverySent}>{c.sentCount} sent</span>
                    <span className={styles.deliveryDelivered}>{c.deliveredCount} ok</span>
                    {c.failedCount > 0 ? (
                      <span className={styles.deliveryFailed}>{c.failedCount} fail</span>
                    ) : null}
                  </span>
                </td>
                <td>{c.scheduledAt || c.sentAt || c.createdAt}</td>
                <td className={styles.actionsCell}>
                  <button
                    type="button"
                    className={styles.actionsButton}
                    onClick={() => toggleMenu(c.id)}
                    aria-label={`Actions for ${c.title}`}
                    aria-expanded={openMenuId === c.id}
                  >
                    <MoreHorizIcon className={styles.actionsIcon} />
                  </button>
                  <ActionMenu
                    campaignId={c.id}
                    onEdit={onEdit}
                    onSend={onSend}
                    onSchedule={onSchedule}
                    onCancel={onCancel}
                    open={openMenuId === c.id}
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
