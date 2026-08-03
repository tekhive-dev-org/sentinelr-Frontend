import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getBreadcrumbs } from "../../config/routes";
import { useAdminAuth } from "../../context/AuthContext";
import AdminProfileMenu from "./AdminProfileMenu";
import styles from "./AdminHeader.module.css";

export default function AdminHeader({ onMenuToggle, isSidebarOpen, badges }) {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const breadcrumbs = getBreadcrumbs(router.pathname);
  const activeAlerts = badges?.activeAlerts ?? 0;

  return (
    <header className={styles.header}>
      {/* ── Left: mobile logo + hamburger + breadcrumbs ── */}
      <div className={styles.left}>
        <Link href="/dashboard" className={styles.mobileLogoLink} aria-label="Sentinelr Dashboard">
          <Image
            src="/favicon.png"
            alt="Sentinelr"
            width={30}
            height={30}
            className={styles.mobileLogo}
            priority
          />
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          onClick={onMenuToggle}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <MenuOpenOutlinedIcon /> : <MenuOutlinedIcon />}
        </button>

        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <ol>
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.path ?? index} className={styles.crumb}>
                {index > 0 && (
                  <ChevronRightIcon className={styles.separator} aria-hidden="true" />
                )}

                {index === 0 ? (
                  <button
                    type="button"
                    className={styles.crumbHome}
                    onClick={() => router.push(crumb.path)}
                    aria-label={crumb.label}
                  >
                    <HomeOutlinedIcon className={styles.homeIcon} />
                  </button>
                ) : crumb.path ? (
                  <button
                    type="button"
                    className={styles.crumbLink}
                    onClick={() => router.push(crumb.path)}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={styles.crumbCurrent}>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* ── Right: notifications + profile ── */}
      <div className={styles.right}>
        <button
          type="button"
          className={styles.notificationButton}
          aria-label={`Notifications${activeAlerts > 0 ? `: ${activeAlerts} active alerts` : ""}`}
          onClick={() => router.push("/dashboard/alerts")}
        >
          <NotificationsOutlinedIcon />
          {activeAlerts > 0 && (
            <span className={styles.badge}>{activeAlerts}</span>
          )}
        </button>

        <AdminProfileMenu user={adminUser} />
      </div>
    </header>
  );
}
