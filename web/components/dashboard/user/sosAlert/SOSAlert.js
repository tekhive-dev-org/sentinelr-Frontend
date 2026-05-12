/**
 * SOSAlert
 * Main container for the SOS Alert dashboard page.
 *
 * Layout (desktop):
 *  ┌────────────────────────────────────────────────────────────┐
 *  │  ┌─────────────┐  ┌──────────────────────────────────────┐ │
 *  │  │ Critical SOS │  │                                      │ │
 *  │  │ Banner       │  │            Map                       │ │
 *  │  │              │  │                                      │ │
 *  │  │ Device Stats │  │                                      │ │
 *  │  │              │  │                                      │ │
 *  │  │ Actions      │  │                                      │ │
 *  │  └─────────────┘  └──────────────────────────────────────┘ │
 *  │                                                            │
 *  │  Recent Alert History                                      │
 *  │  ┌────────────────────────────────────────────────────────┐ │
 *  │  │  Table (Name, Date, Location, Trigger, Status)        │ │
 *  │  └────────────────────────────────────────────────────────┘ │
 *  └────────────────────────────────────────────────────────────┘
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { alertsService } from '../../../../services/alertsService';
import { supabase } from '../../../../services/supabaseClient';
import { devicesService } from '../../../../services/devicesService';
import { familyService } from '../../../../services/familyService';
import SOSAlertBanner from './SOSAlertBanner';
import SOSAlertMap from './SOSAlertMap';
import SOSAlertHistory from './SOSAlertHistory';
import SOSAlertIncidentModal from './SOSAlertIncidentModal';
import Toast from '../../../common/Toast';
import styles from './SOSAlert.module.css';

const ACTIVE_STATUSES = new Set(['active', 'unresolved']);

function asText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
}

function titleCase(value) {
  return asText(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatRelativeTime(dateValue) {
  if (!dateValue) return 'Just now';

  const eventTime = new Date(dateValue).getTime();
  if (Number.isNaN(eventTime)) return 'Recently';

  const diffMs = Date.now() - eventTime;
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function formatElapsedTime(startValue, endValue) {
  if (!startValue) return 'Awaiting sync';

  const startTime = new Date(startValue).getTime();
  const endTime = endValue ? new Date(endValue).getTime() : Date.now();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return 'Awaiting sync';
  }

  const diffSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function formatTriggerLabel(type) {
  const normalized = asText(type, 'alert').toLowerCase();

  if (normalized === 'sos') return 'Manual SOS';
  if (normalized === 'intruder') return 'Intruder alert';
  if (normalized === 'geofence') return 'Geofence breach';
  if (normalized === 'impact') return 'Impact detected';
  if (normalized === 'screen_time') return 'Screen time breach';

  return titleCase(normalized);
}

function formatStatus(status) {
  if (status === 'dismissed') return 'Dismissed';
  if (status === 'unresolved') return 'Unresolved';
  return titleCase(status || 'active');
}

function formatPriority(priority) {
  if (priority === 'critical') return 'Critical';
  if (priority === 'high') return 'High priority';
  if (priority === 'medium') return 'Medium priority';
  if (priority === 'low') return 'Low priority';
  return titleCase(priority || 'high');
}

function buildIncidentCode(alert) {
  const rawId = String(alert?.id ?? alert?.alertId ?? alert?.deviceId ?? alert?.userId ?? '0')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return `INC-${rawId.slice(-6).padStart(6, '0')}`;
}

function dedupeAlerts(alertGroups) {
  const alertMap = new Map();

  alertGroups.flat().forEach((alert) => {
    if (!alert) return;

    const key = String(alert.id ?? alert.alertId ?? `${alert.userId}-${alert.createdAt}-${alert.type}`);
    if (!alertMap.has(key)) {
      alertMap.set(key, alert);
    }
  });

  return Array.from(alertMap.values());
}

function normalizeMembers(familyData) {
  const rawMembers = familyData?.family?.members || familyData?.members || [];

  return rawMembers.map((entry) => {
    const user = entry?.user || entry || {};
    const userId = user.id || entry?.userId || entry?.memberUserId || entry?.id;

    return {
      userId: userId == null ? null : String(userId),
      name: asText(
        user.fullName,
        user.userName,
        user.name,
        entry?.fullName,
        entry?.userName,
        entry?.name,
        'Tracked member',
      ),
      email: asText(user.email, entry?.email, 'No email on file'),
      phone: asText(user.phone, entry?.phone, 'Emergency contact unavailable'),
      relationship: asText(entry?.relationship, user.role, 'Family member'),
    };
  });
}

function normalizeDevices(devicesData) {
  const rawDevices = devicesData?.devices || [];

  return rawDevices.map((device) => {
    const userId =
      device?.assignedUser?.id ||
      device?.assignedUserId ||
      device?.userId ||
      device?.memberUserId ||
      null;

    return {
      id: String(device?.id ?? device?.deviceId ?? ''),
      userId: userId == null ? null : String(userId),
      name: asText(device?.deviceName, device?.name, `Device ${device?.id ?? device?.deviceId ?? 'pending sync'}`),
      type: titleCase(asText(device?.deviceType, device?.type, device?.platform, 'Mobile device')),
      status: titleCase(asText(device?.status, device?.pairStatus, 'Syncing')),
      batteryLevel: device?.batteryLevel ?? device?.battery_level ?? null,
      speed: device?.speed ?? null,
      speedUnit: asText(device?.speedUnit, 'km/h'),
      movementType: asText(device?.movementType, 'Location monitoring'),
      heading: device?.heading ?? null,
    };
  });
}

function normalizeLocations(locationsData) {
  const rawLocations = locationsData?.locations || [];

  return rawLocations.map((location) => ({
    deviceId: location?.deviceId == null ? null : String(location.deviceId),
    userId: location?.userId == null ? null : String(location.userId),
    userName: asText(location?.userName, 'Tracked member'),
    latitude: toNumber(location?.latitude),
    longitude: toNumber(location?.longitude),
    accuracy: location?.accuracy ?? null,
    address: asText(location?.address),
    timestamp: location?.timestamp || location?.createdAt || null,
  }));
}

function createContextMaps(members, devices, locations) {
  const memberByUserId = new Map();
  const deviceById = new Map();
  const devicesByUserId = new Map();
  const locationByDeviceId = new Map();
  const locationByUserId = new Map();

  members.forEach((member) => {
    if (member.userId) {
      memberByUserId.set(member.userId, member);
    }
  });

  devices.forEach((device) => {
    if (device.id) {
      deviceById.set(device.id, device);
    }

    if (device.userId) {
      const existingDevices = devicesByUserId.get(device.userId) || [];
      existingDevices.push(device);
      devicesByUserId.set(device.userId, existingDevices);
    }
  });

  locations.forEach((location) => {
    if (location.deviceId && !locationByDeviceId.has(location.deviceId)) {
      locationByDeviceId.set(location.deviceId, location);
    }

    if (location.userId && !locationByUserId.has(location.userId)) {
      locationByUserId.set(location.userId, location);
    }
  });

  return {
    memberByUserId,
    deviceById,
    devicesByUserId,
    locationByDeviceId,
    locationByUserId,
  };
}

function normalizeAlert(alert, context) {
  const userId = alert?.userId == null ? null : String(alert.userId);
  const alertDeviceId = alert?.deviceId == null ? null : String(alert.deviceId);
  const member = userId ? context.memberByUserId.get(userId) : null;
  const fallbackDevice = userId ? (context.devicesByUserId.get(userId) || [])[0] : null;
  const device = (alertDeviceId && context.deviceById.get(alertDeviceId)) || fallbackDevice || null;
  const liveLocation =
    (device?.id && context.locationByDeviceId.get(device.id)) ||
    (alertDeviceId && context.locationByDeviceId.get(alertDeviceId)) ||
    (userId && context.locationByUserId.get(userId)) ||
    null;

  const latitude = toNumber(alert?.location?.latitude ?? liveLocation?.latitude);
  const longitude = toNumber(alert?.location?.longitude ?? liveLocation?.longitude);
  const coordinateLabel =
    latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : 'Coordinates syncing from device';

  const normalizedStatus = asText(alert?.status, 'active').toLowerCase() === 'cancelled'
    ? 'dismissed'
    : asText(alert?.status, 'active').toLowerCase();

  const createdAt = alert?.createdAt || alert?.timestamp || liveLocation?.timestamp || new Date().toISOString();
  const resolvedAt = alert?.resolvedAt || alert?.updatedAt || null;
  const batteryLevel = alert?.deviceInfo?.batteryLevel ?? device?.batteryLevel ?? null;
  const speed = alert?.deviceInfo?.speed ?? device?.speed ?? null;
  const speedUnit = asText(alert?.deviceInfo?.speedUnit, device?.speedUnit, 'km/h');
  const heading = alert?.deviceInfo?.heading ?? device?.heading ?? null;
  const incidentTitle = asText(
    alert?.title,
    alert?.type === 'sos' ? 'SOS emergency alert' : `${titleCase(alert?.type)} alert`,
    'Emergency alert',
  );
  const userName = asText(alert?.userName, member?.name, liveLocation?.userName, 'Tracked member');

  return {
    id: String(alert?.id ?? alert?.alertId ?? buildIncidentCode(alert)),
    incidentCode: buildIncidentCode(alert),
    type: asText(alert?.type, 'sos').toLowerCase(),
    title: incidentTitle,
    description: asText(
      alert?.description,
      alert?.message,
      `${incidentTitle} raised from ${userName}'s protected device.`,
    ),
    status: normalizedStatus,
    statusLabel: formatStatus(normalizedStatus),
    priority: asText(alert?.priority, alert?.type === 'sos' ? 'critical' : 'high').toLowerCase(),
    priorityLabel: formatPriority(asText(alert?.priority, alert?.type === 'sos' ? 'critical' : 'high').toLowerCase()),
    triggerLabel: formatTriggerLabel(alert?.type),
    userId,
    userName,
    email: asText(alert?.email, member?.email, 'No email on file'),
    phone: asText(alert?.phone, member?.phone, 'Emergency contact unavailable'),
    relationship: asText(member?.relationship, 'Family member'),
    deviceId: device?.id || alertDeviceId || 'pending-sync',
    deviceName: asText(device?.name, alert?.deviceName, 'Protected mobile device'),
    deviceType: asText(device?.type, 'Mobile device'),
    deviceStatus: asText(device?.status, liveLocation ? 'Online' : 'Syncing'),
    createdAt,
    resolvedAt,
    lastUpdatedAt: liveLocation?.timestamp || resolvedAt || createdAt,
    responseClock: formatElapsedTime(createdAt, normalizedStatus === 'resolved' ? resolvedAt : null),
    relativeTime: formatRelativeTime(createdAt),
    resolution: asText(
      alert?.resolution,
      normalizedStatus === 'resolved'
        ? 'Resolved by operator'
        : normalizedStatus === 'dismissed'
        ? 'Dismissed by operator'
        : 'Awaiting response action',
    ),
    isActive: ACTIVE_STATUSES.has(normalizedStatus),
    batteryLevel,
    batteryLabel:
      typeof batteryLevel === 'number' ? `${Math.round(batteryLevel)}%` : 'Battery telemetry syncing',
    speed,
    speedLabel:
      typeof speed === 'number'
        ? `${speed.toFixed(speed >= 10 ? 0 : 1)} ${speedUnit}`
        : 'Speed telemetry syncing',
    movementType: asText(
      alert?.deviceInfo?.movementType,
      typeof speed === 'number' && speed > 0 ? 'In motion' : '',
      device?.movementType,
      'Location monitoring',
    ),
    headingLabel: typeof heading === 'number' ? `${Math.round(heading)}°` : 'Heading syncing',
    location: {
      latitude,
      longitude,
      accuracy: alert?.location?.accuracy ?? liveLocation?.accuracy ?? null,
      address: asText(alert?.location?.address, liveLocation?.address, coordinateLabel, 'Location pending'),
    },
    locationLabel: asText(alert?.location?.address, liveLocation?.address, coordinateLabel, 'Location pending'),
    coordinatesLabel: coordinateLabel,
    mapQuery:
      latitude != null && longitude != null
        ? `${latitude},${longitude}`
        : asText(alert?.location?.address, liveLocation?.address, userName),
  };
}

function buildDashboardStats(alerts) {
  const now = Date.now();
  const alertsInLast24Hours = alerts.filter((alert) => {
    const createdAt = new Date(alert.createdAt).getTime();
    return !Number.isNaN(createdAt) && now - createdAt <= 24 * 60 * 60 * 1000;
  }).length;

  const resolvedToday = alerts.filter((alert) => {
    if (alert.status !== 'resolved' || !alert.resolvedAt) return false;

    const resolvedDate = new Date(alert.resolvedAt);
    const today = new Date();

    return resolvedDate.toDateString() === today.toDateString();
  }).length;

  const averageResolutionMinutes = (() => {
    const resolvedDurations = alerts
      .filter((alert) => alert.status === 'resolved' && alert.createdAt && alert.resolvedAt)
      .map((alert) => {
        const createdAt = new Date(alert.createdAt).getTime();
        const resolvedAt = new Date(alert.resolvedAt).getTime();
        return Number.isNaN(createdAt) || Number.isNaN(resolvedAt)
          ? null
          : Math.max(0, Math.round((resolvedAt - createdAt) / 60000));
      })
      .filter((value) => value != null);

    if (!resolvedDurations.length) return 'Live';

    const average = Math.round(
      resolvedDurations.reduce((sum, value) => sum + value, 0) / resolvedDurations.length,
    );

    return `${average} min`;
  })();

  return [
    {
      label: 'Active incidents',
      value: alerts.filter((alert) => alert.isActive).length,
      meta: 'Requires operator action',
      icon: WarningAmberOutlinedIcon,
    },
    {
      label: 'Past 24 hours',
      value: alertsInLast24Hours,
      meta: 'Incident volume across the family',
      icon: QueryStatsOutlinedIcon,
    },
    {
      label: 'Resolved today',
      value: resolvedToday,
      meta: 'Closed from the response console',
      icon: CheckCircleOutlineIcon,
    },
    {
      label: 'Avg. response',
      value: averageResolutionMinutes,
      meta: 'Mean closure time for resolved incidents',
      icon: ShieldOutlinedIcon,
    },
  ];
}

function buildIncidentBrief(alert) {
  if (!alert) return '';

  return [
    `Sentinelr ${alert.title}`,
    `Incident: ${alert.incidentCode}`,
    `Member: ${alert.userName}`,
    `Contact: ${alert.phone}`,
    `Triggered: ${new Date(alert.createdAt).toLocaleString()}`,
    `Location: ${alert.locationLabel}`,
    `Coordinates: ${alert.coordinatesLabel}`,
    `Device: ${alert.deviceName} (${alert.deviceType})`,
    `Status: ${alert.statusLabel}`,
    `Notes: ${alert.description}`,
  ].join('\n');
}

export default function SOSAlert() {
  const [activeAlert, setActiveAlert] = useState(null);
  const [allAlerts, setAllAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [pendingAction, setPendingAction] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const realtimeDisabledRef = useRef(false);

  const fetchAlerts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const [sosResult, alertsResult, familyResult, devicesResult] = await Promise.allSettled([
        alertsService.getSOSAlerts(),
        alertsService.getAlerts({ limit: 50 }),
        familyService.getFamilyMembers(),
        devicesService.getFamilyDevices({ limit: 100 }),
      ]);

      const sosData = sosResult.status === 'fulfilled' ? sosResult.value : { alerts: [] };
      const allData = alertsResult.status === 'fulfilled' ? alertsResult.value : { alerts: [] };
      const familyData = familyResult.status === 'fulfilled' ? familyResult.value : { members: [] };
      const devicesData = devicesResult.status === 'fulfilled' ? devicesResult.value : { devices: [] };
      const locationsData = { locations: [] };

      const members = normalizeMembers(familyData);
      const devices = normalizeDevices(devicesData);
      const locations = normalizeLocations(locationsData);
      const context = createContextMaps(members, devices, locations);

      const normalizedAlerts = dedupeAlerts([sosData.alerts || [], allData.alerts || []])
        .map((alert) => normalizeAlert(alert, context))
        .sort((left, right) => {
          if (Number(right.isActive) !== Number(left.isActive)) {
            return Number(right.isActive) - Number(left.isActive);
          }

          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        });

      const nextActiveAlert =
        normalizedAlerts.find((alert) => alert.type === 'sos' && alert.isActive) ||
        normalizedAlerts.find((alert) => alert.isActive) ||
        null;

      setActiveAlert(nextActiveAlert);
      setAllAlerts(normalizedAlerts);
      setSelectedAlert((currentAlert) => {
        if (!currentAlert) return null;
        return normalizedAlerts.find((alert) => alert.id === currentAlert.id) || null;
      });
    } catch (error) {
      console.error('[SOSAlert] fetch error:', error);
      setToast({ type: 'error', message: 'Unable to refresh SOS incidents right now.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // ── Real-time subscription: refresh on every INSERT / UPDATE on Alerts ────
  useEffect(() => {
    let channel = null;
    let pollingTimer = null;

    const startPolling = () => {
      if (pollingTimer) return;
      pollingTimer = window.setInterval(() => fetchAlerts(true), 30000);
      setRealtimeStatus('polling');
    };

    if (!realtimeDisabledRef.current) {
      try {
        channel = supabase
          .channel('sos-alerts-live')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'Alerts' },
            () => fetchAlerts(true),
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'Alerts' },
            () => fetchAlerts(true),
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setRealtimeStatus('live');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              realtimeDisabledRef.current = true;
              startPolling();
            }
          });
      } catch {
        realtimeDisabledRef.current = true;
        startPolling();
      }
    } else {
      startPolling();
    }

    return () => {
      if (pollingTimer) window.clearInterval(pollingTimer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  const dashboardStats = useMemo(() => buildDashboardStats(allAlerts), [allAlerts]);

  const handleCall = useCallback(async (alert = activeAlert) => {
    if (!alert) return;

    const rawPhone = asText(alert.phone);
    const sanitizedPhone = rawPhone.replace(/[^\d+]/g, '');

    if (!sanitizedPhone || rawPhone === 'Emergency contact unavailable') {
      setToast({ type: 'info', message: 'No verified phone number is available for this incident.' });
      return;
    }

    if (typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = `tel:${sanitizedPhone}`;
      return;
    }

    try {
      await navigator.clipboard.writeText(rawPhone);
      setToast({ type: 'success', message: 'Contact number copied for desktop calling.' });
    } catch {
      setToast({ type: 'info', message: `Primary contact: ${rawPhone}` });
    }
  }, [activeAlert]);

  const handleCopySummary = useCallback(async (alert = activeAlert) => {
    if (!alert) return;

    const incidentBrief = buildIncidentBrief(alert);

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${alert.incidentCode} · ${alert.userName}`,
          text: incidentBrief,
        });
        return;
      } catch {
        // Ignore cancelled share intent and fall back to clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(incidentBrief);
      setToast({ type: 'success', message: 'Incident brief copied to clipboard.' });
    } catch {
      setToast({ type: 'error', message: 'Unable to copy the incident brief right now.' });
    }
  }, [activeAlert]);

  const handleOpenMap = useCallback((alert = activeAlert) => {
    if (!alert) return;

    const query = encodeURIComponent(alert.mapQuery || alert.locationLabel || alert.userName);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  }, [activeAlert]);

  const handleResolve = useCallback(async (alert, resolution = 'Resolved from SOS response console') => {
    if (!alert) return;

    try {
      setPendingAction(`resolve:${alert.id}`);
      await alertsService.resolveAlert(alert.id, { resolution });
      setToast({ type: 'success', message: `${alert.incidentCode} marked as resolved.` });
      await fetchAlerts();
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to resolve the selected alert.' });
    } finally {
      setPendingAction('');
    }
  }, [fetchAlerts]);

  const handleDismiss = useCallback(async (alert) => {
    if (!alert) return;

    try {
      setPendingAction(`dismiss:${alert.id}`);
      await alertsService.dismissAlert(alert.id);
      setToast({ type: 'success', message: `${alert.incidentCode} dismissed.` });
      await fetchAlerts();
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to dismiss the selected alert.' });
    } finally {
      setPendingAction('');
    }
  }, [fetchAlerts]);

  return (
    <div className={styles.container}>
      <div className={styles.commandHeader}>
        <div>
          <div className={styles.commandEyebrowRow}>
            <span className={styles.commandEyebrow}>Emergency operations</span>
            <span className={`${styles.realtimeBadge} ${realtimeStatus === 'live' ? styles.realtimeLive : realtimeStatus === 'polling' ? styles.realtimePolling : styles.realtimeConnecting}`}>
              {realtimeStatus === 'live' ? 'Live' : realtimeStatus === 'polling' ? 'Polling' : 'Connecting…'}
            </span>
          </div>
          <h1 className={styles.commandTitle}>SOS Command Center</h1>
          <p className={styles.commandSubtitle}>
            Monitor live distress events, validate member context, and act on incidents from one operational view.
          </p>
        </div>

        <div className={styles.commandStats}>
          {dashboardStats.map((stat) => {
            const StatIcon = stat.icon;

            return (
              <div key={stat.label} className={styles.commandStatCard}>
                <div className={styles.commandStatIcon}>
                  <StatIcon style={{ fontSize: 18 }} />
                </div>
                <div className={styles.commandStatCopy}>
                  <span className={styles.commandStatLabel}>{stat.label}</span>
                  <strong className={styles.commandStatValue}>{stat.value}</strong>
                  <span className={styles.commandStatMeta}>{stat.meta}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.contentPad}>
        {activeAlert ? (
          <div className={styles.topSection}>
            <SOSAlertBanner
              alert={activeAlert}
              pendingAction={pendingAction}
              onCall={handleCall}
              onCopySummary={handleCopySummary}
              onOpenMap={handleOpenMap}
              onResolve={handleResolve}
              onDismiss={handleDismiss}
            />
            <SOSAlertMap alert={activeAlert} onOpenMap={handleOpenMap} onViewDetails={setSelectedAlert} />
          </div>
        ) : (
          <div className={styles.topSection}>
            <div className={styles.noAlertCard}>
              <div className={styles.noAlertIcon}>
                <CheckCircleOutlineIcon />
              </div>
              <h3 className={styles.noAlertTitle}>No Active SOS Incidents</h3>
              <p className={styles.noAlertDesc}>
                The response queue is clear. Historical incidents remain available below for audit, follow-up, and export.
              </p>
            </div>
          </div>
        )}

        <SOSAlertHistory
          alerts={allAlerts}
          loading={loading}
          pendingAction={pendingAction}
          onViewDetails={setSelectedAlert}
          onCall={handleCall}
          onCopySummary={handleCopySummary}
          onOpenMap={handleOpenMap}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
        />
      </div>

      <SOSAlertIncidentModal
        alert={selectedAlert}
        isOpen={Boolean(selectedAlert)}
        pendingAction={pendingAction}
        onClose={() => setSelectedAlert(null)}
        onCall={handleCall}
        onCopySummary={handleCopySummary}
        onOpenMap={handleOpenMap}
        onResolve={handleResolve}
        onDismiss={handleDismiss}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
