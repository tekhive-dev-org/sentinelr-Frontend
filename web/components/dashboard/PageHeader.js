import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Image from 'next/image';
import styles from './PageHeader.module.css';
import LogoutModal from './LogoutModal';

export default function PageHeader({ title, subtitle, icon, user, onMenuClick, hasNotifications = true, isAdmin = false, onLogout }) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileMenuRef = useRef(null);
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

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = () => {
    setShowProfileMenu(false);
    if (onLogout) {
      onLogout();
    } else {
      setShowLogoutModal(true);
    }
  };

  return (
    <>
    <header className={styles.header}>
      <div className={styles.headerContainer}> 
      <div className={styles.leftSection}>
        <button className={`${styles.menuBtn} ${!isAdmin ? styles.menuBtnUserMobile : ''}`} onClick={onMenuClick}>
          <MenuIcon />
        </button>
        
        {renderIcon()}
        
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.avatarWrapper} ref={profileMenuRef}>
          <div className={styles.userAvatar} onClick={() => setShowProfileMenu((v) => !v)}>
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

          {/* Profile dropdown menu (mobile for users, always for all) */}
          {showProfileMenu && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileDropdownUser}>
                <span className={styles.profileDropdownName}>
                  {user?.userName || user?.name || 'User'}
                </span>
                <span className={styles.profileDropdownEmail}>
                  {user?.email || ''}
                </span>
              </div>
              <div className={styles.profileDropdownDivider} />
              <button
                className={styles.profileDropdownItem}
                onClick={() => {
                  setShowProfileMenu(false);
                  router.push('/dashboard/settings');
                }}
              >
                <PersonOutlineRoundedIcon style={{ fontSize: 18 }} />
                My Profile
              </button>
              <button
                className={`${styles.profileDropdownItem} ${styles.profileDropdownDanger}`}
                onClick={handleLogout}
              >
                <LogoutRoundedIcon style={{ fontSize: 18 }} />
                Logout
              </button>
            </div>
          )}
        </div>
        
        <button className={styles.notificationBtn}>
          <NotificationsNoneOutlinedIcon style={{ fontSize: '22px', color: '#6b7280' }} />
          {hasNotifications && <span className={styles.notificationBadge}></span>}
        </button>
      </div>
      </div>
    </header>

    <LogoutModal
      isOpen={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      onConfirm={() => {
        setShowLogoutModal(false);
        if (onLogout) onLogout();
      }}
    />
    </>
  );
}
