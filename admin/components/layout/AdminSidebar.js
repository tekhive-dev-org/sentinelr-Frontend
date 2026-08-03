import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Tooltip from "@mui/material/Tooltip";

import { ADMIN_ROUTES } from "../../config/routes";
import useAuthorization from "../../hooks/useAuthorization";
import { useAdminAuth } from "../../context/AuthContext";
import styles from "./AdminSidebar.module.css";

function getInitials(name) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

export default function AdminSidebar({
  isOpen = true,
  onToggle,
  isCompact = false,
  badges = {},
}) {
  const router = useRouter();
  const { can } = useAuthorization();
  const { adminUser, logout } = useAdminAuth();

  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userSectionRef = useRef(null);

  const toggleGroup = useCallback((groupName) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  }, []);

  const filteredRoutes = useMemo(
    () =>
      ADMIN_ROUTES.map((group) => ({
        ...group,
        items: group.items.filter((item) => can(item.permission)),
      })).filter((group) => group.items.length > 0),
    [can],
  );

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userSectionRef.current && !userSectionRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    router.push("/login");
  };

  const displayName = adminUser?.name || adminUser?.userName || "Admin";
  const displayEmail = adminUser?.email || "admin@sentinelr.com";
  const initials = getInitials(displayName);

  return (
    <aside
      className={styles.sidebar}
      data-compact={isCompact}
      aria-label="Admin navigation"
    >
      {/* ── Brand header ── */}
      <div className={styles.header}>
        <span className={styles.logo} aria-hidden="true">
          S
        </span>
        {!isCompact && <span className={styles.brandName}>Sentinelr</span>}
      </div>

      {/* ── Scrollable navigation ── */}
      <nav className={styles.nav}>
        {filteredRoutes.map((group) => {
          const isCollapsed = Boolean(collapsedGroups[group.group]);

          return (
            <div key={group.group}>
              {/* Group header — compact mode: plain divider */}
              {isCompact ? (
                <div className={styles.compactDivider} role="separator">
                  <span className={styles.compactLabel}>{group.group}</span>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.groupHeader}
                  onClick={() => toggleGroup(group.group)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`nav-group-${group.group}`}
                >
                  <span>{group.group}</span>
                  <KeyboardArrowDownIcon
                    className={styles.groupChevron}
                    data-expanded={!isCollapsed}
                    fontSize="inherit"
                  />
                </button>
              )}

              {/* Group items */}
              <div
                id={`nav-group-${group.group}`}
                className={styles.collapse}
                style={
                  !isCompact && isCollapsed
                    ? { maxHeight: 0, visibility: "hidden" }
                    : undefined
                }
                role={isCompact ? undefined : "group"}
                aria-label={isCompact ? undefined : group.group}
              >
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? router.pathname === item.path
                    : router.pathname.startsWith(item.path);

                  const showBadge =
                    item.badgeKey && badges[item.badgeKey] > 0;

                  const IconComponent = item.icon;

                  const navLink = (
                    <Link
                      href={item.path}
                      className={styles.navItem}
                      data-active={isActive}
                      data-compact={isCompact}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className={styles.menuIcon}>
                        <IconComponent aria-hidden="true" />
                      </span>
                      <span
                        className={styles.navItemLabel}
                        data-compact={isCompact}
                      >
                        {item.label}
                      </span>
                      {showBadge && (
                        <span
                          className={styles.badge}
                          data-compact={isCompact}
                          aria-label={`${badges[item.badgeKey]} notifications`}
                        >
                          {badges[item.badgeKey]}
                        </span>
                      )}
                    </Link>
                  );

                  if (isCompact) {
                    return (
                      <Tooltip
                        key={item.id}
                        title={item.label}
                        placement="right"
                        arrow
                      >
                        {navLink}
                      </Tooltip>
                    );
                  }

                  return <div key={item.id}>{navLink}</div>;
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── User Profile Section at bottom ── */}
      <div
        className={styles.userSection}
        ref={userSectionRef}
        data-compact={isCompact}
      >
        {showUserMenu && !isCompact && (
          <div className={styles.userMenu}>
            <button
              type="button"
              className={styles.userMenuItem}
              onClick={() => {
                setShowUserMenu(false);
                router.push("/dashboard/settings");
              }}
            >
              <span className={styles.menuIcon}>
                <SettingsOutlinedIcon style={{ fontSize: 18 }} />
              </span>
              My Profile
            </button>
            <div className={styles.menuDivider} />
            <button
              type="button"
              className={`${styles.userMenuItem} ${styles.danger}`}
              onClick={handleLogout}
            >
              <span className={styles.menuIcon}>
                <LogoutOutlinedIcon style={{ fontSize: 18 }} />
              </span>
              Logout
            </button>
          </div>
        )}

        <div
          className={styles.userProfile}
          data-compact={isCompact}
          onClick={() => !isCompact && setShowUserMenu((v) => !v)}
          role="button"
          tabIndex={0}
        >
          <div className={styles.profileAvatar}>{initials}</div>
          {!isCompact && (
            <>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{displayName}</div>
                <div className={styles.profileEmail}>{displayEmail}</div>
              </div>
              <ChevronRightIcon
                className={styles.profileArrow}
                style={{
                  transform: showUserMenu ? "rotate(-90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Toggle button ── */}
      <button
        type="button"
        className={styles.toggleBtn}
        data-compact={isCompact}
        onClick={onToggle}
        aria-label={isCompact ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCompact ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
        {!isCompact && <span>Collapse</span>}
      </button>
    </aside>
  );
}
