import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { ADMIN_ROUTES } from "../../config/routes";
import useAuthorization from "../../hooks/useAuthorization";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./AdminMobileNav.module.css";

export default function AdminMobileNav({ badges = {} }) {
  const { can } = useAuthorization();
  const router = useRouter();
  const [overlayOpen, setOverlayOpen] = useState(false);

  const accessibleItems = useMemo(() => {
    const items = [];
    ADMIN_ROUTES.forEach((group) => {
      group.items.forEach((item) => {
        if (can(item.permission)) {
          items.push({ ...item, group: group.group });
        }
      });
    });
    return items;
  }, [can]);

  const barItems = accessibleItems.slice(0, 5);
  const hasMore = accessibleItems.length > 5;

  const groupedItems = useMemo(() => {
    const groups = {};
    ADMIN_ROUTES.forEach((group) => {
      const filtered = group.items.filter((item) => can(item.permission));
      if (filtered.length > 0) {
        groups[group.group] = filtered;
      }
    });
    return groups;
  }, [can]);

  const isActive = useCallback(
    (item) => {
      if (item.exact) return router.pathname === item.path;
      return router.pathname.startsWith(item.path);
    },
    [router.pathname],
  );

  useEffect(() => {
    if (overlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  const handleNavigate = (path) => {
    setOverlayOpen(false);
    router.push(path);
  };

  if (accessibleItems.length === 0) return null;

  return (
    <>
      <nav className={styles.bar} aria-label="Mobile navigation">
        {barItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.navButton} ${isActive(item) ? styles.navButtonActive : ""}`}
            onClick={() => handleNavigate(item.path)}
            aria-label={item.label}
            aria-current={isActive(item) ? "page" : undefined}
          >
            <span className={styles.iconWrap}>
              <item.icon className={styles.icon} />
              {badges[item.badgeKey] != null && (
                <span className={styles.badge}>{badges[item.badgeKey]}</span>
              )}
            </span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}

        {hasMore && (
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setOverlayOpen(true)}
            aria-label="More navigation options"
            aria-expanded={overlayOpen}
          >
            <span className={styles.iconWrap}>
              <MoreHorizOutlinedIcon className={styles.icon} />
            </span>
            <span className={styles.label}>More</span>
          </button>
        )}
      </nav>

      {overlayOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className={styles.backdrop}
            onClick={() => setOverlayOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Navigation</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setOverlayOpen(false)}
                aria-label="Close navigation"
              >
                <CloseIcon />
              </button>
            </div>
            <div className={styles.drawerBody}>
              {Object.entries(groupedItems).map(([group, items]) => (
                <div key={group} className={styles.group}>
                  <h3 className={styles.groupTitle}>{group}</h3>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.menuItem} ${isActive(item) ? styles.menuItemActive : ""}`}
                      onClick={() => handleNavigate(item.path)}
                      aria-current={isActive(item) ? "page" : undefined}
                    >
                      <item.icon className={styles.menuItemIcon} />
                      <span className={styles.menuItemLabel}>{item.label}</span>
                      {badges[item.badgeKey] != null && (
                        <span className={styles.menuItemBadge}>
                          {badges[item.badgeKey]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
