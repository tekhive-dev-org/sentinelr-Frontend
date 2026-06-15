/**
 * ParentalControlDashboard
 * 
 * Full parental control management interface matching the design spec:
 * - Child/member selector with device picker
 * - Daily screen time with progress and breakdown
 * - Bedtime schedule editor
 * - Quick Pause (freeze device / bonus hour)
 * - Web filtering with blocked sites management
 * - App category blocking with toggles
 * - Recent parental control activity feed
 */

import React, { useState, useEffect, useCallback } from 'react';
import { parentalControlService } from '../../../../services/parentalControlService';
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

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatMinutes(mins) {
  if (!mins && mins !== 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function timeAgo(timestamp) {
  const parsed = new Date(timestamp).getTime();
  if (!timestamp || Number.isNaN(parsed)) return 'Recently';

  const diff = Date.now() - parsed;
  if (diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}



export default function ParentalControlDashboard() {
  // ── State ────────────────────────────────────────────────────────────────
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [controls, setControls] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityLimit, setActivityLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // UI state
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [showBedtimeModal, setShowBedtimeModal] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [siteSearch, setSiteSearch] = useState('');
  const [bedtimeForm, setBedtimeForm] = useState({ startTime: '21:30', endTime: '07:00' });

  // ── Fetch Members ────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    try {
      const data = await parentalControlService.getMembers();
      const mems = data.members || [];
      setMembers(mems);
      // Don't auto-select — user must manually pick a member and device
    } catch {
      showToast('Failed to load family members', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Controls ───────────────────────────────────────────────────────
  const fetchControls = useCallback(async () => {
    if (!selectedMember || !selectedDevice) return;
    try {
      setLoading(true);
      // Use device-status for the richest available data; fall back to getControls
      const data = await parentalControlService
        .getDeviceStatus(selectedMember.userId, selectedDevice.deviceId)
        .catch(() =>
          parentalControlService.getControls(selectedMember.userId, selectedDevice.deviceId)
        );
      setControls(data.controls || null);

      // Fetch activity
      const actData = await parentalControlService
        .getActivity(selectedMember.userId, selectedDevice.deviceId, activityLimit)
        .catch(() => ({ activities: [] }));
      setActivities(actData.activities || []);
    } catch {
      showToast('Failed to load parental controls', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMember, selectedDevice, activityLimit]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { if (selectedMember && selectedDevice) fetchControls(); }, [fetchControls]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSelectedDevice(null);
    setControls(null);
    setActivities([]);
    setShowChildDropdown(false);
  };

  const handleDeviceChange = (e) => {
    const dev = selectedMember?.devices?.find(d => d.deviceId === e.target.value);
    setSelectedDevice(dev || null);
  };

  const handleToggleMonitoring = async () => {
    if (!controls || !selectedMember) return;
    try {
      const newVal = !controls.isMonitoring;
      await parentalControlService.toggleMonitoring(
        selectedMember.userId,
        newVal,
        selectedDevice?.deviceId
      );
      setControls(prev => ({ ...prev, isMonitoring: newVal }));
      showToast(`Monitoring ${newVal ? 'enabled' : 'disabled'}`);
    } catch {
      showToast('Failed to toggle monitoring', 'error');
    }
  };

  const handleToggleCategory = async (category, currentEnabled) => {
    if (!selectedMember) return;
    try {
      await parentalControlService.toggleCategoryBlock(
        selectedMember.userId,
        selectedDevice?.deviceId,
        category,
        !currentEnabled
      );
      setControls(prev => ({
        ...prev,
        appBlocking: {
          ...prev.appBlocking,
          categoryBlocked: prev.appBlocking.categoryBlocked.map(c =>
            c.category === category ? { ...c, enabled: !currentEnabled } : c
          ),
        },
      }));
      showToast(`${category} blocking ${!currentEnabled ? 'enabled' : 'disabled'}`);
    } catch {
      showToast('Failed to update category', 'error');
    }
  };

  const handleToggleApp = async (packageName, currentBlocked) => {
    if (!selectedMember) return;
    try {
      await parentalControlService.toggleAppBlock(
        selectedMember.userId,
        selectedDevice?.deviceId,
        packageName,
        !currentBlocked
      );
      setControls(prev => ({
        ...prev,
        appBlocking: {
          ...prev.appBlocking,
          appOverrides: prev.appBlocking.appOverrides.map(a =>
            a.packageName === packageName ? { ...a, isBlocked: !currentBlocked } : a
          ),
        },
      }));
      showToast(`App ${!currentBlocked ? 'blocked' : 'unblocked'}`);
    } catch {
      showToast('Failed to update app block', 'error');
    }
  };

  const handleFreezeToggle = async () => {
    if (!selectedMember || !selectedDevice) return;
    try {
      const isFrozen = controls?.quickPause?.isDeviceFrozen;
      if (isFrozen) {
        await parentalControlService.unfreezeDevice(selectedMember.userId, selectedDevice.deviceId);
      } else {
        await parentalControlService.freezeDevice(selectedMember.userId, selectedDevice.deviceId);
      }
      setControls(prev => ({
        ...prev,
        quickPause: { ...prev.quickPause, isDeviceFrozen: !isFrozen },
      }));
      showToast(isFrozen ? 'Device unfrozen' : 'Device frozen');
    } catch {
      showToast('Failed to update device freeze', 'error');
    }
  };

  const handleBonusHour = async () => {
    if (!selectedMember || !selectedDevice) return;
    try {
      const result = await parentalControlService.grantBonusTime(
        selectedMember.userId,
        selectedDevice.deviceId,
        60
      );
      if (controls?.screenTimeLimit) {
        setControls(prev => ({
          ...prev,
          screenTimeLimit: {
            ...prev.screenTimeLimit,
            remaining: result.newRemaining || prev.screenTimeLimit.remaining + 60,
          },
        }));
      }
      showToast('Bonus hour granted!');
    } catch {
      showToast('Failed to grant bonus time', 'error');
    }
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newSiteUrl.trim() || !selectedMember) return;
    try {
      const result = await parentalControlService.addBlockedSite(selectedMember.userId, selectedDevice?.deviceId, newSiteUrl.trim());
      setControls(prev => ({
        ...prev,
        webFiltering: {
          ...prev.webFiltering,
          blockedSites: result.blockedSites || [...(prev.webFiltering.blockedSites || []), newSiteUrl.trim()],
        },
      }));
      setNewSiteUrl('');
      setShowAddSite(false);
      showToast('Website blocked');
    } catch {
      showToast('Failed to add website', 'error');
    }
  };

  const handleRemoveSite = async (url) => {
    if (!selectedMember) return;
    try {
      const result = await parentalControlService.removeBlockedSite(selectedMember.userId, selectedDevice?.deviceId, url);
      setControls(prev => ({
        ...prev,
        webFiltering: {
          ...prev.webFiltering,
          blockedSites: result.blockedSites || prev.webFiltering.blockedSites.filter(s => s !== url),
        },
      }));
      showToast('Website removed');
    } catch {
      showToast('Failed to remove website', 'error');
    }
  };

  const handleSaveBedtime = async () => {
    if (!selectedMember || !selectedDevice) return;
    try {
      await parentalControlService.updateBedtime(
        selectedMember.userId,
        selectedDevice.deviceId,
        { enabled: true, startTime: bedtimeForm.startTime, endTime: bedtimeForm.endTime },
      );
      setControls(prev => ({
        ...prev,
        bedtime: { enabled: true, startTime: bedtimeForm.startTime, endTime: bedtimeForm.endTime },
      }));
      setShowBedtimeModal(false);
      showToast('Bedtime schedule updated');
    } catch {
      showToast('Failed to update bedtime', 'error');
    }
  };

  const handleSaveScreenTime = async (settings) => {
    if (!selectedMember || !selectedDevice) return;
    try {
      await parentalControlService.updateScreenTime(
        selectedMember.userId,
        selectedDevice.deviceId,
        settings
      );
      setControls(prev => {
        const currentUsed = prev?.screenTimeLimit?.usedToday || 0;
        const currentRemaining = settings.enabled ? Math.max(0, settings.dailyLimit - currentUsed) : 0;
        
        // Reset the local ticking session timer to match newly saved config
        const localKey = `sentinelr_timer_${selectedDevice.deviceId}`;
        const todayStr = new Date().toISOString().split('T')[0];
        localStorage.setItem(localKey, JSON.stringify({
          date: todayStr,
          dailyLimit: settings.dailyLimit,
          usedToday: currentUsed,
          remaining: currentRemaining,
          lastSaved: Date.now()
        }));

        return {
          ...prev,
          screenTimeLimit: {
            ...prev.screenTimeLimit,
            enabled: settings.enabled,
            dailyLimit: settings.dailyLimit,
            remaining: currentRemaining
          }
        };
      });
      showToast('Screen time limit updated successfully');
    } catch {
      showToast('Failed to update screen time settings', 'error');
    }
  };

  // ── Loading State ────────────────────────────────────────────────────────
  if (loading && !controls) {
    return <DashboardSkeleton />;
  }

  // ── Empty State (no members) ─────────────────────────────────────────────
  if (members.length === 0 && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><PeopleAltRoundedIcon sx={{ fontSize: 56, color: '#d1d5db' }} /></div>
          <h3 className={styles.emptyTitle}>No Family Members Found</h3>
          <p className={styles.emptySubtitle}>
            Add family members and pair their devices to start managing parental controls.
          </p>
        </div>
      </div>
    );
  }

  // ── No Selection State ───────────────────────────────────────────────────
  if (!selectedMember || !selectedDevice) {
    return (
      <div className={styles.container}>
        <div className={styles.noSelectionContainer}>
          <div className={styles.noSelectionHeader}>
            <div className={styles.emptyIcon}>
              <PeopleAltRoundedIcon sx={{ fontSize: 32, color: 'var(--clr-primary)' }} />
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
