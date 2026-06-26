import React from 'react';
import styles from '../ParentalControl.module.css';

export default function ChildProfileSummary({
  members = [],
  selectedMember = null,
  selectedDevice = null,
  controls = null,
  showChildDropdown = false,
  setShowChildDropdown = () => {},
  handleSelectMember = () => {},
  handleDeviceChange = () => {},
  handleToggleMonitoring = () => {},
}) {
  if (!selectedMember) return null;

  return (
    <div className={styles.profileSummaryContainer}>
      {/* ── Top Profile Bar ────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.childProfileHeader}>
          <div className={styles.childLargeAvatar}>
            {selectedMember.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className={styles.childInfo}>
            <h2 className={styles.childName}>{selectedMember.name}&apos;s Protection Dashboard</h2>
            <span className={styles.childSubtitle}>Real-time activity monitoring and restriction status</span>
          </div>
        </div>
        
        <div className={styles.topBarRight}>
          {selectedMember.devices?.length > 0 && (
            <div className={styles.deviceSelectWrapper}>
              <select
                className={styles.deviceSelect}
                value={selectedDevice?.deviceId || ''}
                onChange={handleDeviceChange}
              >
                {selectedMember.devices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>📱 {d.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            className={`${styles.monitoringBadge} ${controls?.isMonitoring ? styles.monitoringActive : styles.monitoringInactive}`}
            onClick={handleToggleMonitoring}
          >
            <span className={`${styles.monitoringDot} ${controls?.isMonitoring ? styles.monitoringDotActive : styles.monitoringDotInactive}`} />
            {controls?.isMonitoring ? 'Active Monitoring' : 'Monitoring Off'}
          </button>
        </div>
      </div>
    </div>
  );
}
