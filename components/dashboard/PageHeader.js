import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle }) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <button className={styles.notificationBtn}>
        <NotificationsNoneOutlinedIcon />
      </button>
    </header>
  );
}
