import React from 'react';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
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

      {/* ── Child Selector Floating Badge ─────────────────────────────── */}
      {/* {members.length > 0 && (
        <>
          <div
            className={styles.childSelector}
            onClick={() => setShowChildDropdown(!showChildDropdown)}
          >
            <div className={styles.childAvatar}>
              {selectedMember.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className={styles.childSelectorInfo}>
              <span className={styles.childSelectorName}>{selectedMember.name}</span>
              <span className={styles.childSelectorEmail}>
                {selectedDevice?.name || 'Select a paired device'}
              </span>
            </div>
            <ChevronRightRoundedIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
          </div>

          {showChildDropdown && (
            <div className={styles.childDropdown}>
              {members.map((m) => (
                <button
                  key={m.userId}
                  className={`${styles.childDropdownItem} ${
                    m.userId === selectedMember.userId ? styles.childDropdownItemActive : ''
                  }`}
                  onClick={() => handleSelectMember(m)}
                >
                  <div className={styles.childAvatar} style={{ width: 28, height: 28, fontSize: 12 }}>
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )} */}
    </div>
  );
}
