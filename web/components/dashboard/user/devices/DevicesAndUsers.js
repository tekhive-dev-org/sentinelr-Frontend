import React, { useState } from 'react';
import styles from './DevicesAndUsers.module.css';
import DevicesList from './DevicesList';
import UsersList from './UsersList';
import PairDevice from './PairDevice';
import AddMemberModal from './AddMemberModal';
import UserDetailModal from './UserDetailModal';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

// View modes
const VIEW_MODES = {
  LIST: 'list',
  PAIRING: 'pairing',
};

export default function DevicesAndUsers() {
  const [viewMode, setViewMode] = useState(VIEW_MODES.LIST);
  const [activeTab, setActiveTab] = useState('devices');
  const [showWarning, setShowWarning] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data - replace with actual API data
  const [devices, setDevices] = useState([
    /*
    {
      id: 'dev_001',
      name: 'Sharon Bliss iphone',
      type: 'phone',
      deviceType: 'IOS',
      battery: 59,
      status: 'offline',
      lastSeen: '07-08-2025',
    },
    {
      id: 'dev_002',
      name: 'Nneka Samsung',
      type: 'android',
      deviceType: 'Android',
      battery: 70,
      status: 'online',
      lastSeen: '07-08-2025',
    },
    {
      id: 'dev_003',
      name: 'Chidieberes Phone',
      type: 'android',
      deviceType: 'Android',
      battery: 65,
      status: 'online',
      lastSeen: '07-08-2025',
    },
    {
      id: 'dev_004',
      name: 'Kelvin Chidis iphone',
      type: 'phone',
      deviceType: 'IOS',
      battery: 55,
      status: 'offline',
      lastSeen: '07-08-2025',
    },
    {
      id: 'dev_005',
      name: 'Chidi Victors Iphone',
      type: 'phone',
      deviceType: 'IOS',
      battery: 43,
      status: 'online',
      lastSeen: '07-08-2025',
    },
    */
  ]);
  
  const [users, setUsers] = useState([
    /*
    {
      id: 'user_001',
      name: 'Sharon Bliss',
      email: 'sharonbliss9@gmail.com',
      phone: '08160232043',
      role: 'Parent',
      status: 'offline',
    },
    {
      id: 'user_002',
      name: 'Nneka Amadi',
      email: 'nnekaamadi45@gmail.com',
      phone: '09058394839',
      role: 'Child',
      status: 'online',
    },
    {
      id: 'user_003',
      name: 'Chidiebere British',
      email: 'chidieberebritish@gmail.com',
      phone: '08160232043',
      role: 'Child',
      status: 'offline',
    },
    {
      id: 'user_004',
      name: 'Kelvin Chidi',
      email: 'Kelvinchidi@gmail.com',
      phone: '07-08-2025',
      role: 'Parent',
      status: 'online',
    },
    {
      id: 'user_005',
      name: 'Chidi Victor',
      email: 'chidivictor@gmail.com',
      phone: '07-08-2025',
      role: 'Child',
      status: 'online',
    },
    */
  ]);

  // Handle add new member
  const handleAddMember = (memberData) => {
    setUsers([...users, memberData]);
  };

  // Handle user click to open detail modal
  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  // Handle successful pairing
  const handlePairingComplete = (deviceData) => {
    setDevices([...devices, { 
      id: Date.now(), 
      name: deviceData?.name || 'New Device',
      type: 'phone',
      status: 'online',
      ...deviceData 
    }]);
  };

  // Handle view devices after pairing
  const handleViewDevices = () => {
    setViewMode(VIEW_MODES.LIST);
    setActiveTab('devices');
  };

  // Handle cancel pairing
  const handleCancelPairing = () => {
    setViewMode(VIEW_MODES.LIST);
  };

  // Start pairing flow
  const handleStartPairing = () => {
    setViewMode(VIEW_MODES.PAIRING);
  };

  const filteredDevices = devices.filter(device => 
    device.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get warning banner content based on view mode
  const getWarningContent = () => {
    if (viewMode === VIEW_MODES.PAIRING) {
      return (
        <ol className={styles.warningList}>
          <li>Install the Sentinelr app on the device</li>
          <li>Open the app and choose "Pair Device"</li>
          <li>Enter this code or scan the QR</li>
          <li>Enable Permissions</li>
        </ol>
      );
    }
    return <span>Please, create a profile first before adding a device to track.</span>;
  };

  // Render list view
  const renderListView = () => (
    <>
      {/* Add Button - shown when items exist */}
      {(activeTab === 'devices' ? devices.length > 0 : users.length > 0) && (
        <div className={styles.headerActions}>
          <button 
            className={styles.addDevicesBtn} 
            onClick={activeTab === 'devices' ? handleStartPairing : () => setIsAddMemberModalOpen(true)}
          >
            + {activeTab === 'devices' ? 'Add Devices' : 'Add Family Member'}
            <span className={styles.addDevicesBtnArrow}>›</span>
          </button>
        </div>
      )}

      {/* Devices List Card */}
      <div className={styles.listCard}>
        <h2 className={styles.listTitle}>
          {activeTab === 'devices' ? 'Devices List' : 'All Family Members'}
        </h2>

        <div className={styles.controlsRow}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'devices' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('devices')}
            >
              Devices
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users/Members
            </button>
          </div>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder={activeTab === 'devices' ? 'Search for a device...' : 'Search...'}
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'devices' ? (
            <DevicesList 
              devices={filteredDevices} 
              onAddDevice={handleStartPairing} 
            />
          ) : (
            <UsersList 
              users={filteredUsers} 
              onAddUser={() => setIsAddMemberModalOpen(true)}
              onUserClick={handleUserClick}
            />
          )}
        </div>
      </div>
    </>
  );

  // Render pairing view
  const renderPairingView = () => (
    <PairDevice 
      onComplete={handlePairingComplete}
      onCancel={handleCancelPairing}
      onViewDevices={handleViewDevices}
    />
  );

  return (
    <div className={styles.container}>
      {/* Warning Banner */}
      {showWarning && (
        <div className={styles.warningBanner}>
          <div className={styles.warningContent}>
            <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V14M12 21.41H5.94C2.47 21.41 1.02 18.93 2.7 15.9L5.82 10.28L8.76 5C10.54 1.79 13.46 1.79 15.24 5L18.18 10.29L21.3 15.91C22.98 18.94 21.52 21.42 18.06 21.42H12V21.41Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.995 17H12.004" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {getWarningContent()}
          </div>
          <button className={styles.warningClose} onClick={() => setShowWarning(false)}>
            <CloseIcon style={{ fontSize: 18 }} />
          </button>
        </div>
      )}

      {/* Main Content based on view mode */}
      {viewMode === VIEW_MODES.LIST ? renderListView() : renderPairingView()}

      {/* Modals */}
      <AddMemberModal 
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
      />
      <UserDetailModal 
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onPairDevice={(user) => {
          setSelectedUser(null);
          handleStartPairing();
        }}
      />
    </div>
  );
}

