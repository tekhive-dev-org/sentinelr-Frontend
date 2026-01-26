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

  const profileImage =
    user?.profilePictureUrl ||
    user?.profilePicture ||
    user?.avatarUrl ||
    user?.avatar ||
    user?.imageUrl ||
    user?.photoUrl;

  const getInitials = (value) => {
    if (!value) return 'U';
    const parts = value.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
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
          {profileImage ? (
            <img
              src={profileImage}
              alt="User"
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {getInitials(user?.userName || user?.name || user?.email)}
            </div>
          )}
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
