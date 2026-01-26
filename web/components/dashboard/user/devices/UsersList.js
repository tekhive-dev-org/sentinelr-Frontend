import React from 'react';
import styles from './DevicesAndUsers.module.css';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function UsersList({ users = [], onAddUser, onUserClick }) {
  if (users.length === 0) {
    return (
      <div className={styles.emptyState}>
        {/* Empty State Illustration - Clipboard with checklist */}
        <svg className={styles.emptyIllustration} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Clipboard body */}
          <rect x="30" y="25" width="60" height="75" rx="4" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="2"/>
          {/* Clipboard clip */}
          <rect x="45" y="18" width="30" height="14" rx="2" fill="#E5E7EB"/>
          <rect x="50" y="21" width="20" height="8" rx="1" fill="#D1D5DB"/>
          {/* Checklist lines */}
          <rect x="40" y="45" width="10" height="10" rx="2" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
          <line x1="55" y1="50" x2="80" y2="50" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
          <rect x="40" y="62" width="10" height="10" rx="2" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
          <line x1="55" y1="67" x2="75" y2="67" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
          <rect x="40" y="79" width="10" height="10" rx="2" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
          <line x1="55" y1="84" x2="70" y2="84" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
          {/* Sparkles */}
          <path d="M95 30L96.5 34L100.5 35.5L96.5 37L95 41L93.5 37L89.5 35.5L93.5 34L95 30Z" fill="#D1D5DB"/>
          <path d="M20 45L21 48L24 49L21 50L20 53L19 50L16 49L19 48L20 45Z" fill="#E5E7EB"/>
        </svg>

        <h3 className={styles.emptyTitle}>No Family Member Added Yet</h3>
        <p className={styles.emptyDescription}>
          To add new member to pair, please, click the add button.
        </p>
        
        <button className={styles.addButton} onClick={onAddUser}>
          <AddIcon className={styles.addButtonIcon} />
          Add Member
          <ChevronRightIcon className={styles.addButtonIcon} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.devicesTableContainer}>
      {/* Users Table */}
      <table className={styles.devicesTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className={styles.deviceNameCell}>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.role}</td>
              <td>
                <span className={`${styles.statusBadge} ${user.status === 'online' ? styles.statusOnlineBadge : styles.statusOfflineBadge}`}>
                  <span className={styles.statusDotSmall}></span>
                  {user.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </td>
              <td>
                <button 
                  className={styles.tableActionBtn}
                  onClick={() => onUserClick && onUserClick(user)}
                >
                  <MoreVertIcon style={{ fontSize: 18 }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

