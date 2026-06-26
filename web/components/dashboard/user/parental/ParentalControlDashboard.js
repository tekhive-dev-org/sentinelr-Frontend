import React from 'react';
import Toast from '../../../common/Toast';
import styles from './ParentalControl.module.css';
import { DashboardSkeleton } from '../../../ui/loaders';

// Subcomponents
import ChildProfileSummary from './components/ChildProfileSummary';
import DeviceActivityOverview from './components/DeviceActivityOverview';
import QuickActions from './components/QuickActions';
import ScreenTimeManager from './components/ScreenTimeManager';
import WebFilteringManager from './components/WebFilteringManager';
import AppBlockingManager from './components/AppBlockingManager';
import AlertsOverview from './components/AlertsOverview';

// MUI Icons
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';

// Hooks & Utils
import { useParentalControlDashboard } from './hooks/useParentalControlDashboard';
import { formatMinutes } from './utils/parentalUtils';

export default function ParentalControlDashboard() {
  const {
    members,
    selectedMember,
    setSelectedMember,
    selectedDevice,
    setSelectedDevice,
    controls,
    activities,
    activityLimit,
    setActivityLimit,
    loading,
    toast,
    setToast,
    showChildDropdown,
    setShowChildDropdown,
    showBedtimeModal,
    setShowBedtimeModal,
    showAddSite,
    setShowAddSite,
    newSiteUrl,
    setNewSiteUrl,
    siteSearch,
    setSiteSearch,
    bedtimeForm,
    setBedtimeForm,
    handleSelectMember,
    handleDeviceChange,
    handleToggleMonitoring,
    handleToggleCategory,
    handleToggleApp,
    handleFreezeToggle,
    handleBonusHour,
    handleAddSite,
    handleRemoveSite,
    handleSaveBedtime,
    handleSaveScreenTime,
  } = useParentalControlDashboard();

  // Loading State
  if (loading && !controls) {
    return <DashboardSkeleton />;
  }

  // Empty State (no members)
  if (members.length === 0 && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><PeopleAltRoundedIcon className={styles.emptyIconSvg} /></div>
          <h3 className={styles.emptyTitle}>No Family Members Found</h3>
          <p className={styles.emptySubtitle}>
            Add family members and pair their devices to start managing parental controls.
          </p>
        </div>
      </div>
    );
  }

  // No Selection State
  if (!selectedMember || !selectedDevice) {
    return (
      <div className={styles.container}>
        <div className={styles.noSelectionContainer}>
          <div className={styles.noSelectionHeader}>
            <div className={styles.emptyIcon}>
              <PeopleAltRoundedIcon className={styles.emptyIconSmallSvg} />
            </div>
            <h3 className={styles.noSelectionTitle}>Family Protection Center</h3>
            <p className={styles.noSelectionSubtitle}>
              Select a family member&apos;s device below to monitor live activity and configure restriction limits.
            </p>
          </div>

          <div className={styles.membersGrid}>
            {members.map((member) => (
              <div key={member.userId} className={styles.memberCard}>
                <div className={styles.memberCardHeader}>
                  <div className={styles.memberCardAvatar}>
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className={styles.memberCardInfo}>
                    <h4 className={styles.memberNameText}>{member.name}</h4>
                    <span className={styles.memberDevicesCount}>
                      {member.devices?.length || 0} paired {member.devices?.length === 1 ? 'device' : 'devices'}
                    </span>
                  </div>
                </div>

                <div className={styles.memberDevicesList}>
                  {member.devices?.length > 0 ? (
                    member.devices.map((device) => (
                      <button
                        key={device.deviceId}
                        onClick={() => {
                          setSelectedMember(member);
                          setSelectedDevice(device);
                        }}
                        className={styles.devicePairButton}
                      >
                        <span className={styles.devicePairIcon}>📱</span>
                        <div className={styles.devicePairDetails}>
                          <span className={styles.devicePairName}>{device.name}</span>
                          <span className={styles.devicePairStatus}>Active Telemetry</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <span className={styles.noDevicesText}>No paired devices found</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Child Profile Header & Selector */}
      <ChildProfileSummary
        members={members}
        selectedMember={selectedMember}
        selectedDevice={selectedDevice}
        controls={controls}
        showChildDropdown={showChildDropdown}
        setShowChildDropdown={setShowChildDropdown}
        handleSelectMember={handleSelectMember}
        handleDeviceChange={handleDeviceChange}
        handleToggleMonitoring={handleToggleMonitoring}
      />

      {/* Device Activity Status Telemetries */}
      <DeviceActivityOverview selectedDevice={selectedDevice} />

      {/* Configurations & Toggles Grid */}
      <div className={styles.mainGrid}>
        {/* Screen Time allowed and bedtime limits */}
        <ScreenTimeManager
          screenTimeLimit={controls?.screenTimeLimit}
          bedtime={controls?.bedtime}
          deviceId={selectedDevice?.deviceId}
          onEditBedtime={() => {
            setBedtimeForm({
              startTime: controls?.bedtime?.startTime || '21:30',
              endTime: controls?.bedtime?.endTime || '07:00',
            });
            setShowBedtimeModal(true);
          }}
          formatMinutes={formatMinutes}
          onSaveScreenTime={handleSaveScreenTime}
        />

        {/* Quick Pause and bonus overrides */}
        <QuickActions
          controls={controls}
          handleFreezeToggle={handleFreezeToggle}
          handleBonusHour={handleBonusHour}
        />

        {/* Domain blocked configurations */}
        <WebFilteringManager
          webFilter={controls?.webFiltering}
          showAddSite={showAddSite}
          setShowAddSite={setShowAddSite}
          newSiteUrl={newSiteUrl}
          setNewSiteUrl={setNewSiteUrl}
          siteSearch={siteSearch}
          setSiteSearch={setSiteSearch}
          handleAddSite={handleAddSite}
          handleRemoveSite={handleRemoveSite}
        />
      </div>

      {/* Category Blocking Overrides */}
      <AppBlockingManager
        appBlocking={controls?.appBlocking}
        handleToggleCategory={handleToggleCategory}
        handleToggleApp={handleToggleApp}
      />

      {/* Recent Activity Alert Logs */}
      <AlertsOverview
        activities={activities}
        activityLimit={activityLimit}
        setActivityLimit={setActivityLimit}
        loading={loading}
      />

      {/* Bedtime Setting Modal */}
      {showBedtimeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBedtimeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Edit Bedtime Schedule</h3>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Start Lock</label>
              <input
                type="time"
                className={styles.modalInput}
                value={bedtimeForm.startTime}
                onChange={(e) => setBedtimeForm(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>End Lock</label>
              <input
                type="time"
                className={styles.modalInput}
                value={bedtimeForm.endTime}
                onChange={(e) => setBedtimeForm(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setShowBedtimeModal(false)}>
                Cancel
              </button>
              <button className={styles.modalSaveBtn} onClick={handleSaveBedtime}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
