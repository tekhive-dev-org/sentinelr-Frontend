import React, { useState } from 'react';
import styles from './DevicesAndUsers.module.css';
import CloseIcon from '@mui/icons-material/Close';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import LaptopIcon from '@mui/icons-material/Laptop';
import WatchIcon from '@mui/icons-material/Watch';

const deviceTypes = [
  { id: 'phone', label: 'Smartphone', icon: SmartphoneIcon },
  { id: 'tablet', label: 'Tablet', icon: TabletIcon },
  { id: 'laptop', label: 'Laptop', icon: LaptopIcon },
  { id: 'watch', label: 'Smartwatch', icon: WatchIcon },
];

export default function AddDeviceModal({ isOpen, onClose, onSubmit }) {
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('phone');
  const [assignedUser, setAssignedUser] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;
    
    onSubmit({
      name: deviceName,
      type: deviceType,
      assignedUser: assignedUser || null,
      status: 'offline',
      createdAt: new Date().toISOString(),
    });

    // Reset form
    setDeviceName('');
    setDeviceType('phone');
    setAssignedUser('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add New Device</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Device Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Device Name</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g., John's iPhone"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
              />
            </div>

            {/* Device Type */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Device Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {deviceTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = deviceType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setDeviceType(type.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        border: isSelected ? '2px solid #1F2937' : '1px solid #E5E7EB',
                        borderRadius: '10px',
                        background: isSelected ? '#F9FAFB' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon style={{ fontSize: 24, color: isSelected ? '#1F2937' : '#6B7280' }} />
                      <span style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#1F2937' : '#374151' }}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assign to User (Optional) */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assign to User (Optional)</label>
              <select
                className={styles.formSelect}
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
              >
                <option value="">Select a user...</option>
                <option value="user1">John Doe</option>
                <option value="user2">Jane Doe</option>
                <option value="user3">Child 1</option>
              </select>
            </div>

            {/* Pairing Instructions */}
            <div style={{ 
              background: '#F0F9FF', 
              border: '1px solid #BAE6FD', 
              borderRadius: '8px', 
              padding: '16px',
              marginTop: '8px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0369A1', marginBottom: '8px' }}>
                Next Steps
              </h4>
              <p style={{ fontSize: '13px', color: '#0C4A6E', lineHeight: 1.5 }}>
                After adding the device, you'll receive a pairing code. Install the Sentinelr app on the target device and enter the code to complete the setup.
              </p>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Add Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
