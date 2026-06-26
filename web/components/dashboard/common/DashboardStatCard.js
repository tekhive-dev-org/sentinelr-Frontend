import React, { useEffect, useRef, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import styles from "./DashboardStatCard.module.css";

const ACTION_ICONS = {
  refresh: RefreshIcon,
  navigate: ArrowForwardIcon,
};

export default function DashboardStatCard({
  title,
  value,
  meta,
  Icon,
  tone = "orange",
  status = "Ready",
  statusTone = "neutral",
  loading = false,
  error = "",
  emptyText = "No data available",
  actions = [],
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const hasMenu = actions.length > 0;
  const isEmpty = !loading && !error && (value === null || value === undefined || value === "");
  const displayStatus = error ? "Sync issue" : status;
  const displayStatusTone = error ? "danger" : statusTone;

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleAction = (action) => {
    setOpen(false);
    action.onSelect?.();
  };

  return (
    <article className={`${styles.card} ${styles[tone] || styles.orange} ${error ? styles.hasError : ""}`}>
      <span className={styles.accent} aria-hidden="true" />
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <div className={styles.iconWrap}>{Icon ? <Icon className={styles.icon} /> : null}</div>
          <div>
            <h3 className={styles.title}>{title}</h3>
            <span className={`${styles.statusPill} ${styles[displayStatusTone] || styles.neutral}`}>
              <span className={styles.statusDot} />
              {displayStatus}
            </span>
          </div>
        </div>

        {hasMenu && (
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              type="button"
              className={styles.moreButton}
              aria-label={`${title} actions`}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
            >
              <MoreVertIcon className={styles.moreIcon} />
            </button>
            {open && (
              <div className={styles.dropdown} role="menu">
                {actions.map((action) => {
                  const ActionIcon = action.icon || ACTION_ICONS[action.kind];
                  return (
                    <button
                      key={action.label}
                      type="button"
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => handleAction(action)}
                    >
                      {ActionIcon ? <ActionIcon className={styles.dropdownIcon} /> : null}
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.body}>
        {loading ? (
          <>
            <div className={styles.valueSkeleton} />
            <div className={styles.metaSkeleton} />
          </>
        ) : error ? (
          <>
            <div className={styles.errorState}>
              <strong className={styles.value}>0</strong>
              <span className={styles.errorBadge}>Needs refresh</span>
            </div>
            <p className={styles.errorText}>{error}</p>
          </>
        ) : isEmpty ? (
          <>
            <strong className={styles.value}>0</strong>
            <p className={styles.meta}>{emptyText}</p>
          </>
        ) : (
          <>
            <strong className={styles.value}>{value}</strong>
            {meta ? <p className={styles.meta}>{meta}</p> : null}
          </>
        )}
      </div>
    </article>
  );
}
