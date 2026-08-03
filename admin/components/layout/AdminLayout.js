import { useState, useCallback } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminMobileNav from "./AdminMobileNav";
import styles from "./AdminLayout.module.css";

const STORAGE_KEY = "admin_sidebar_compact";

function getInitialCompact() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export default function AdminLayout({ children, badges = {} }) {
  const [isCompact, setIsCompact] = useState(getInitialCompact);

  const handleToggleCompact = useCallback(() => {
    setIsCompact((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div className={styles.layout} data-compact={isCompact}>
      <div className={styles.sidebar}>
        <AdminSidebar
          isOpen
          isCompact={isCompact}
          onToggle={handleToggleCompact}
          badges={badges}
        />
      </div>

      <div className={styles.mainArea}>
        <AdminHeader
          isSidebarOpen={!isCompact}
          onMenuToggle={handleToggleCompact}
          badges={badges}
        />

        <main className={styles.content}>{children}</main>
      </div>

      <AdminMobileNav badges={badges} />
    </div>
  );
}
