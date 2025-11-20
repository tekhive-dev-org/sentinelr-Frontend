import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle, onMenuClick, hasNotifications = true }) {
  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={onMenuClick}>
        <MenuIcon />
      </button>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <button className={styles.notificationBtn}>
        <NotificationsNoneOutlinedIcon />
        {hasNotifications && <span className={styles.notificationBadge}></span>}
      </button>
    </header>
  );
}
