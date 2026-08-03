import { useMemo } from "react";
import Link from "next/link";
import styles from "./OperationalPanels.module.css";

import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import CreditCardOffOutlinedIcon from "@mui/icons-material/CreditCardOffOutlined";
import WifiOffOutlinedIcon from "@mui/icons-material/WifiOffOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

/* ------------------------------------------------------------------ */
/*  Panel card — handles loading, empty, error, and unavailable states */
/* ------------------------------------------------------------------ */

function PanelCard({ icon: Icon, title, link, isLoading, isError, isUnavailable, emptyText, renderContent }) {
  const showFooter = !isLoading && link;

  return (
    <article className={styles.panel}>
      {/* ---- header ---- */}
      <div className={styles.header}>
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon className={styles.icon} />
        </span>
        <h3 className={styles.title}>{title}</h3>
      </div>

      <hr className={styles.divider} />

      {/* ---- body ---- */}
      <div className={styles.body}>
        {isLoading && <p className={styles.stateMuted}>Loading…</p>}

        {!isLoading && isUnavailable && (
          <p className={styles.stateMuted}>API not available</p>
        )}

        {!isLoading && !isUnavailable && isError && (
          <p className={styles.stateMuted}>API not available</p>
        )}

        {!isLoading && !isUnavailable && !isError && renderContent && renderContent()}

        {!isLoading && !isUnavailable && !isError && !renderContent && emptyText && (
          <p className={styles.stateText}>{emptyText}</p>
        )}
      </div>

      {/* ---- footer ---- */}
      {showFooter && (
        <div className={styles.footer}>
          <Link href={link} className={styles.viewAll}>
            View all
            <ArrowForwardIcon className={styles.viewAllIcon} fontSize="inherit" />
          </Link>
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  OperationalPanels — 6-panel operational overview grid             */
/* ------------------------------------------------------------------ */

export default function OperationalPanels({ widgetErrors = {}, recentUsers = null, isLoading = false }) {
  /* ---- derived helpers ---- */
  const recentUserList = useMemo(() => {
    if (!recentUsers || !Array.isArray(recentUsers)) return null;
    return recentUsers.slice(0, 5);
  }, [recentUsers]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /* ---- panel definitions ---- */
  const panels = [
    {
      key: "sos",
      icon: CampaignOutlinedIcon,
      title: "Unresolved SOS Incidents",
      link: "/dashboard/alerts",
      isUnavailable: false,
      isError: Boolean(widgetErrors.alertsOS),
      emptyText: "No active SOS incidents",
      renderContent: null,
    },
    {
      key: "flagged",
      icon: ReportProblemOutlinedIcon,
      title: "Flagged Accounts",
      link: "/dashboard/users",
      isUnavailable: false,
      isError: Boolean(widgetErrors.flaggedAccounts),
      emptyText: "No flagged accounts",
      renderContent: null,
    },
    {
      key: "recentUsers",
      icon: PersonAddOutlinedIcon,
      title: "Recently Registered",
      link: "/dashboard/users",
      isUnavailable: false,
      isError: Boolean(widgetErrors.recentUsers),
      emptyText: "No recent registrations",
      renderContent:
        recentUserList && recentUserList.length > 0
          ? () => (
              <ul className={styles.userList}>
                {recentUserList.map((user) => (
                  <li key={user.id ?? user.email} className={styles.userItem}>
                    <div className={styles.userInfo}>
                      <p className={styles.userName}>{user.name ?? "—"}</p>
                      <p className={styles.userEmail}>{user.email ?? "—"}</p>
                    </div>
                    <span className={styles.userDate}>
                      {user.createdAt ? formatDate(user.createdAt) : user.date ? formatDate(user.date) : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )
          : null,
    },
    {
      key: "payments",
      icon: CreditCardOffOutlinedIcon,
      title: "Failed Payments",
      link: "/dashboard/subscriptions",
      isUnavailable: true,
      isError: false,
      emptyText: null,
      renderContent: null,
    },
    {
      key: "devices",
      icon: WifiOffOutlinedIcon,
      title: "Offline Devices",
      link: "/dashboard/devices",
      isUnavailable: true,
      isError: false,
      emptyText: null,
      renderContent: null,
    },
    {
      key: "audit",
      icon: HistoryOutlinedIcon,
      title: "Recent Admin Actions",
      link: "/dashboard/audit",
      isUnavailable: true,
      isError: false,
      emptyText: null,
      renderContent: null,
    },
  ];

  return (
    <div className={styles.grid}>
      {panels.map((p) => (
        <PanelCard
          key={p.key}
          icon={p.icon}
          title={p.title}
          link={p.link}
          isLoading={isLoading}
          isError={p.isError}
          isUnavailable={p.isUnavailable}
          emptyText={p.emptyText}
          renderContent={p.renderContent}
        />
      ))}
    </div>
  );
}
