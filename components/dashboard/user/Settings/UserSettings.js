import React, { useState } from 'react';
import AccountTab from './AccountTab';
import PasswordTab from './PasswordTab';
import NotificationsTab from './NotificationsTab';
import styles from './Settings.module.css';

export default function UserSettings({ user }) {
  const [activeTab, setActiveTab] = useState('Account');

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {['Account', 'Password', 'Notifications'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'Account' && <AccountTab user={user} />}
        {activeTab === 'Password' && <PasswordTab />}
        {activeTab === 'Notifications' && <NotificationsTab />}
      </div>
    </div>
  );
}
