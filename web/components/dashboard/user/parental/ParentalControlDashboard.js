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

// MUI Icons
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import MoreTimeRoundedIcon from '@mui/icons-material/MoreTimeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

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
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

// Category icon + color mapping
const CATEGORY_CONFIG = {
  Gaming: { icon: <SportsEsportsRoundedIcon sx={{ fontSize: 20 }} />, bg: '#fef2f2', color: '#ef4444' },
  'Social Media': { icon: <GroupRoundedIcon sx={{ fontSize: 20 }} />, bg: '#f0fdf4', color: '#22c55e' },
  Entertainment: { icon: <MovieRoundedIcon sx={{ fontSize: 20 }} />, bg: '#fefce8', color: '#eab308' },
  TikTok: { icon: <MusicNoteRoundedIcon sx={{ fontSize: 20 }} />, bg: '#f0f9ff', color: '#0ea5e9' },
  Facebook: { icon: <FacebookRoundedIcon sx={{ fontSize: 20 }} />, bg: '#eff6ff', color: '#3b82f6' },
  WhatsApp: { icon: <ChatRoundedIcon sx={{ fontSize: 20 }} />, bg: '#f0fdf4', color: '#22c55e' },
};
const DEFAULT_CATEGORY = { icon: <SmartphoneRoundedIcon sx={{ fontSize: 20 }} />, bg: '#f3f4f6', color: '#6b7280' };

// Activity type config
const ACTIVITY_CONFIG = {
  app_install: { icon: <GetAppRoundedIcon sx={{ fontSize: 16, color: '#16a34a' }} />, bg: '#dcfce7', color: '#16a34a' },
  web_blocked: { icon: <BlockRoundedIcon sx={{ fontSize: 16, color: '#dc2626' }} />, bg: '#fee2e2', color: '#dc2626' },
  screen_time_limit: { icon: <TimerRoundedIcon sx={{ fontSize: 16, color: '#4f46e5' }} />, bg: '#e0e7ff', color: '#4f46e5' },
  geofence: { icon: <PlaceRoundedIcon sx={{ fontSize: 16, color: '#ca8a04' }} />, bg: '#fef9c3', color: '#ca8a04' },
  app_blocked: { icon: <LockRoundedIcon sx={{ fontSize: 16, color: '#db2777' }} />, bg: '#fce7f3', color: '#db2777' },
};
const DEFAULT_ACTIVITY = { icon: <AssignmentRoundedIcon sx={{ fontSize: 16, color: '#6b7280' }} />, bg: '#f3f4f6', color: '#6b7280' };

export default function ParentalControlDashboard() {
  // ── State ────────────────────────────────────────────────────────────────
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [controls, setControls] = useState(null);
  const [activities, setActivities] = useState([]);
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
      const data = await parentalControlService.getMembers().catch(() => ({ members: [] }));
      const mems = data.members || [];
      setMembers(mems);
      if (mems.length > 0 && !selectedMember) {
        setSelectedMember(mems[0]);
        if (mems[0].devices?.length > 0) {
          setSelectedDevice(mems[0].devices[0]);
        }
      }
    } catch {
      showToast('Failed to load family members', 'error');
    }
  }, []);

  // ── Fetch Controls ───────────────────────────────────────────────────────
  const fetchControls = useCallback(async () => {
    if (!selectedMember) return;
    try {
      setLoading(true);
      const data = await parentalControlService.getControls(
        selectedMember.userId,
        selectedDevice?.deviceId
      );
      setControls(data.controls || null);

      // Fetch activity
      const actData = await parentalControlService.getActivity(
        selectedMember.userId,
        selectedDevice?.deviceId,
        10
      ).catch(() => ({ activities: [] }));
      setActivities(actData.activities || []);
    } catch {
      showToast('Failed to load parental controls', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMember, selectedDevice]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { if (selectedMember) fetchControls(); }, [fetchControls]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSelectedDevice(member.devices?.[0] || null);
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
      const result = await parentalControlService.addBlockedSite(selectedMember.userId, newSiteUrl.trim());
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
      const result = await parentalControlService.removeBlockedSite(selectedMember.userId, url);
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
    if (!selectedMember) return;
    try {
      await parentalControlService.updateBedtime(selectedMember.userId, {
        enabled: true,
        startTime: bedtimeForm.startTime,
        endTime: bedtimeForm.endTime,
      });
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

  // ── Loading State ────────────────────────────────────────────────────────
  if (loading && !controls) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Loading parental controls…</span>
        </div>
      </div>
    );
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

  const st = controls?.screenTimeLimit;
  const bedtime = controls?.bedtime;
  const quickPause = controls?.quickPause;
  const webFilter = controls?.webFiltering;
  const appBlocking = controls?.appBlocking;
  const isFrozen = quickPause?.isDeviceFrozen;

  const usedPercent = st?.dailyLimit
    ? Math.min(100, Math.round(((st.usedToday || 0) / st.dailyLimit) * 100))
    : 0;

  const filteredSites = (webFilter?.blockedSites || []).filter(s =>
    s.toLowerCase().includes(siteSearch.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.childInfo}>
          <h2 className={styles.childName}>{selectedMember?.name}&apos;s Dashboard</h2>
          <span className={styles.childSubtitle}>Real-time activity and protection status</span>
        </div>
        <div className={styles.topBarRight}>
          {selectedMember?.devices?.length > 0 && (
            <select
              className={styles.deviceSelect}
              value={selectedDevice?.deviceId || ''}
              onChange={handleDeviceChange}
            >
              {selectedMember.devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.name}</option>
              ))}
            </select>
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

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        {/* Screen Time Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <span className={styles.cardTitleIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}><BarChartRoundedIcon sx={{ fontSize: 18 }} /></span>
              Daily Screen Time
            </span>
            <span className={styles.cardSubtext}>Target: {formatMinutes(st?.dailyLimit)}</span>
          </div>
          <div className={styles.screenTimeValue}>{formatMinutes(st?.usedToday)}</div>
          <div className={styles.screenTimeRemaining}>
            {formatMinutes(st?.remaining)} remaining
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${usedPercent}%` }} />
          </div>
          <div className={styles.screenTimeBreakdown}>
            {st?.breakdown && Object.entries(st.breakdown).slice(0, 2).map(([key, val]) => (
              <div key={key} className={styles.breakdownItem}>
                <div className={styles.breakdownLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className={styles.breakdownValue}>{formatMinutes(val)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bedtime Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <span className={styles.cardTitleIcon} style={{ background: '#fef3c7', color: '#d97706' }}><BedtimeRoundedIcon sx={{ fontSize: 18 }} /></span>
              Bedtime
            </span>
          </div>
          <div className={styles.bedtimeRow}>
            <div className={styles.bedtimeItem}>
              <span className={styles.bedtimeLabel}>Start lock</span>
              <span className={styles.bedtimeValue}>{bedtime?.startTime || '21:30'}</span>
            </div>
            <div className={styles.bedtimeItem}>
              <span className={styles.bedtimeLabel}>End lock</span>
              <span className={styles.bedtimeValue}>{bedtime?.endTime || '07:00'}</span>
            </div>
          </div>
          <button
            className={styles.editScheduleBtn}
            onClick={() => {
              setBedtimeForm({
                startTime: bedtime?.startTime || '21:30',
                endTime: bedtime?.endTime || '07:00',
              });
              setShowBedtimeModal(true);
            }}
          >
            Edit Schedule
          </button>
        </div>

        {/* Quick Pause Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <span className={styles.cardTitleIcon} style={{ background: '#fef2f2', color: '#ef4444' }}><PauseCircleFilledRoundedIcon sx={{ fontSize: 18 }} /></span>
              Quick Pause
            </span>
          </div>
          <p className={styles.quickPauseDesc}>Pause all activities on all app instantly</p>
          <button
            className={`${styles.freezeBtn} ${isFrozen ? styles.freezeBtnFrozen : styles.freezeBtnActive}`}
            onClick={handleFreezeToggle}
          >
            {isFrozen ? <><LockOpenRoundedIcon sx={{ fontSize: 18 }} /> UNFREEZE DEVICE</> : <><AcUnitRoundedIcon sx={{ fontSize: 18 }} /> FREEZE DEVICE</>}
          </button>
          <button className={styles.bonusBtn} onClick={handleBonusHour}>
            <MoreTimeRoundedIcon sx={{ fontSize: 18 }} /> Bonus Hour (+1h)
          </button>
        </div>

        {/* Web Filtering Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>
              <span className={styles.cardTitleIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}><LanguageRoundedIcon sx={{ fontSize: 18 }} /></span>
              Web Filtering
            </span>
            <button className={styles.addWebsiteBtn} onClick={() => setShowAddSite(!showAddSite)}>
              {showAddSite ? 'Cancel' : 'Add Website'}
            </button>
          </div>

          {showAddSite && (
            <form className={styles.addSiteForm} onSubmit={handleAddSite}>
              <input
                className={styles.addSiteInput}
                placeholder="e.g. example.com"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
              />
              <button className={styles.addSiteSubmit} type="submit">Block</button>
            </form>
          )}

          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><SearchRoundedIcon sx={{ fontSize: 16, color: '#9ca3af' }} /></span>
            <input
              className={styles.searchInput}
              placeholder="Search blocked URLs..."
              value={siteSearch}
              onChange={(e) => setSiteSearch(e.target.value)}
            />
          </div>

          <div className={styles.blockedSitesList}>
            {filteredSites.length === 0 && (
              <span style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 12 }}>
                No blocked sites
              </span>
            )}
            {filteredSites.map((site) => (
              <div key={site} className={styles.blockedSiteItem}>
                <div className={styles.blockedSiteInfo}>
                  <span className={styles.siteIcon}><LockRoundedIcon sx={{ fontSize: 14, color: '#6b7280' }} /></span>
                  <span className={styles.siteName}>{site}</span>
                </div>
                <button
                  className={styles.removeSiteBtn}
                  onClick={() => handleRemoveSite(site)}
                  title="Remove"
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── App Category Blocking ────────────────────────────────────────── */}
      <h3 className={styles.sectionTitle}>
        <SecurityRoundedIcon sx={{ fontSize: 20, color: '#6b7280' }} />
        App Category Blocking
      </h3>
      <div className={styles.categoryList}>
        {/* Category toggles */}
        {(appBlocking?.categoryBlocked || []).map((cat) => {
          const config = CATEGORY_CONFIG[cat.category] || DEFAULT_CATEGORY;
          return (
            <div key={cat.category} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <div className={styles.categoryIcon} style={{ background: config.bg, color: config.color }}>
                  {config.icon}
                </div>
                <div className={styles.categoryDetails}>
                  <span className={styles.categoryName}>{cat.category}</span>
                  <span className={styles.categoryMeta}>{cat.appsDetected} apps detected</span>
                </div>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={cat.enabled}
                  onChange={() => handleToggleCategory(cat.category, cat.enabled)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          );
        })}

        {/* Individual app overrides */}
        {(appBlocking?.appOverrides || []).map((app) => {
          const config = CATEGORY_CONFIG[app.name] || DEFAULT_CATEGORY;
          return (
            <div key={app.packageName} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <div className={styles.categoryIcon} style={{ background: config.bg, color: config.color }}>
                  {config.icon}
                </div>
                <div className={styles.categoryDetails}>
                  <span className={styles.categoryName}>{app.name}</span>
                  <span className={styles.categoryMeta}>{app.note}</span>
                </div>
              </div>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={app.isBlocked}
                  onChange={() => handleToggleApp(app.packageName, app.isBlocked)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          );
        })}
      </div>

      {/* ── Recent Activity ──────────────────────────────────────────────── */}
      <div className={styles.activitySection}>
        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <div className={styles.activityCard}>
          <div className={styles.activityList}>
            {activities.length === 0 && (
              <span style={{ fontSize: 13, color: '#9ca3af', padding: '12px 0' }}>
                No recent activity
              </span>
            )}
            {activities.map((act) => {
              const cfg = ACTIVITY_CONFIG[act.type] || DEFAULT_ACTIVITY;
              return (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityIcon} style={{ background: cfg.bg }}>
                    {cfg.icon}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      {renderActivityText(act)}
                    </div>
                    <div className={styles.activityTime}>{timeAgo(act.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Child Selector (bottom left) ─────────────────────────────────── */}
      {members.length > 1 && (
        <>
          <div
            className={styles.childSelector}
            onClick={() => setShowChildDropdown(!showChildDropdown)}
          >
            <div className={styles.childAvatar}>
              {selectedMember?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className={styles.childSelectorInfo}>
              <span className={styles.childSelectorName}>{selectedMember?.name}</span>
              <span className={styles.childSelectorEmail}>
                {selectedMember?.devices?.[0]?.name || 'No device'}
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
                    m.userId === selectedMember?.userId ? styles.childDropdownItemActive : ''
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
      )}

      {/* ── Bedtime Modal ────────────────────────────────────────────────── */}
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

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ── Activity text renderer ─────────────────────────────────────────────────────
function renderActivityText(act) {
  switch (act.type) {
    case 'app_install':
      return (
        <>
          {act.description?.split(act.app || '').map((part, i, arr) =>
            i < arr.length - 1 ? (
              <React.Fragment key={i}>
                {part}<strong className={undefined}>{act.app}</strong>
              </React.Fragment>
            ) : part
          )}
        </>
      );
    case 'web_blocked':
      return (
        <>
          Attempted to visit <span style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'underline' }}>{act.url}</span>
          {act.status ? ` (${act.status})` : ''}
        </>
      );
    case 'screen_time_limit':
      return (
        <>
          Screen time limit reached for{' '}
          <span style={{ color: '#3b82f6', fontWeight: 600 }}>{act.app}</span>
        </>
      );
    default:
      return act.description || 'Unknown activity';
  }
}
