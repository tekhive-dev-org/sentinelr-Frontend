import { useState, useEffect, useCallback } from 'react';
import { parentalControlService } from '../../../../../services/parentalControlService';

export function useParentalControlDashboard() {
  // State
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

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Fetch Members
  const fetchMembers = useCallback(async () => {
    try {
      const data = await parentalControlService.getMembers();
      const mems = data.members || [];
      setMembers(mems);
    } catch {
      showToast('Failed to load family members', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Controls
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

  // Handlers
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
    if (e && e.preventDefault) e.preventDefault();
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

  return {
    members,
    selectedMember,
    setSelectedMember,
    selectedDevice,
    setSelectedDevice,
    controls,
    setControls,
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
    fetchMembers,
    fetchControls,
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
    showToast,
  };
}
