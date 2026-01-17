import React from 'react';
import styles from './DevicesAndUsers.module.css';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import LaptopIcon from '@mui/icons-material/Laptop';
import WatchIcon from '@mui/icons-material/Watch';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const deviceIcons = {
  phone: SmartphoneIcon,
  tablet: TabletIcon,
  laptop: LaptopIcon,
  watch: WatchIcon,
};

export default function DeviceCard({ device, onEdit, onDelete }) {
  const Icon = deviceIcons[device.type] || SmartphoneIcon;
  const isOnline = device.status === 'online';
  
  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={styles.deviceCard}>
      <div className={styles.deviceIconWrapper}>
        <Icon style={{ fontSize: 24 }} />
      </div>
      
      <div className={styles.deviceInfo}>
        <div className={styles.deviceName}>{device.name}</div>
        <div className={styles.deviceMeta}>
          {device.assignedUser ? `Assigned to ${device.assignedUser}` : 'Unassigned'}
          {device.lastSeen && ` • Last seen ${formatLastSeen(device.lastSeen)}`}
        </div>
        <div className={`${styles.deviceStatus} ${isOnline ? styles.statusOnline : styles.statusOffline}`}>
          <span className={styles.statusDot}></span>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className={styles.deviceActions}>
        <button className={styles.deviceActionBtn} onClick={() => onEdit?.(device)}>
          <MoreVertIcon style={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
}
