import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle, icon, user, onMenuClick, hasNotifications = true }) {
  // Helper to render the icon
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return (
        <div className={styles.iconWrapper}>
          <Image src={icon} alt="" width={24} height={24} />
        </div>
      );
    }
    
    const IconComponent = icon;
    return (
      <div className={styles.iconWrapper}>
        <IconComponent style={{ fontSize: '24px', color: '#6b7280' }} />
      </div>
    );
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}> 
      <div className={styles.leftSection}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <MenuIcon />
        </button>
        
        {renderIcon()}
        
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.userAvatar}>
          {/* Mock User Image or Initial */}
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="User" 
            className={styles.avatarImage}
          />
          <span className={styles.onlineStatus}></span>
        </div>
        
        <button className={styles.notificationBtn}>
          <NotificationsNoneOutlinedIcon style={{ fontSize: '22px', color: '#6b7280' }} />
          {hasNotifications && <span className={styles.notificationBadge}></span>}
        </button>
      </div>
      </div>
    </header>
  );
}
