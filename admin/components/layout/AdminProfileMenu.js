import { useState, useRef, useEffect } from "react";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useAdminAuth } from "../../context/AuthContext";
import styles from "./AdminProfileMenu.module.css";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminProfileMenu() {
  const { adminUser, logout } = useAdminAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const displayName = adminUser?.name || adminUser?.email || "Admin";
  const displayEmail = adminUser?.email || "";
  const initials = getInitials(adminUser?.name);

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <span className={styles.userInfo}>
          <span className={styles.userName}>{displayName}</span>
          {displayEmail && (
            <span className={styles.userEmail}>{displayEmail}</span>
          )}
        </span>
        <span
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={close}
          >
            <PersonOutlinedIcon className={styles.menuIcon} />
            Profile
          </button>

          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={close}
          >
            <SettingsOutlinedIcon className={styles.menuIcon} />
            Settings
          </button>

          <div className={styles.divider} role="separator" />

          <button
            type="button"
            className={`${styles.menuItem} ${styles.logoutItem}`}
            role="menuitem"
            onClick={() => {
              close();
              logout();
            }}
          >
            <LogoutOutlinedIcon className={styles.menuIcon} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
