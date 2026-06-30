import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { alertsService } from '../../../../../services/alertsService';
import { devicesService } from '../../../../../services/devicesService';
import { familyService } from '../../../../../services/familyService';
import {
  useAlertsSubscription,
} from '../../../../../context/RealtimeSubscriptionContext';
import { onStatusChange } from '../../../../../services/realtimeSubscriptionService';
import {
  asText,
  normalizeMembers,
  normalizeDevices,
  normalizeLocations,
  createContextMaps,
  dedupeAlerts,
  normalizeAlert,
  buildDashboardStats,
  buildIncidentBrief,
} from '../utils/sosAlertUtils';

export function useSOSAlert() {
  const [allAlerts, setAllAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [pendingAction, setPendingAction] = useState('');
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');

  // Ref to always read latest selectedDeviceId in fetch callbacks
  const selectedDeviceIdRef = useRef(selectedDeviceId);
  selectedDeviceIdRef.current = selectedDeviceId;

  const fetchAlerts = useCallback(async (silent = false, deviceId = selectedDeviceIdRef.current) => {
    if (!silent) setLoading(true);

    try {
      // ── Device-specific fetch ──────────────────────────────────────────
      if (deviceId && deviceId !== 'all') {
        const [deviceAlertsResult, familyResult, devicesResult] = await Promise.allSettled([
          alertsService.getDeviceAlerts(deviceId, { type: 'all', status: 'all', limit: 50, offset: 0 }),
          familyService.getFamilyMembers(),
          devicesService.getFamilyDevices({ pairStatus: 'Paired', limit: 100 }),
        ]);

        const deviceData = deviceAlertsResult.status === 'fulfilled' ? deviceAlertsResult.value : { alerts: [] };
        const familyData = familyResult.status === 'fulfilled' ? familyResult.value : { members: [] };
        const devicesData = devicesResult.status === 'fulfilled' ? devicesResult.value : { devices: [] };
        const locationsData = { locations: [] };

        const members = normalizeMembers(familyData);
        const devices = normalizeDevices(devicesData);
        const locations = normalizeLocations(locationsData);
        const context = createContextMaps(members, devices, locations);

        const alertsArray = deviceData.alerts || [];
        const normalizedAlerts = alertsArray
          .map((alert) => normalizeAlert(alert, context))
          .sort((left, right) => {
            if (Number(right.isActive) !== Number(left.isActive)) {
              return Number(right.isActive) - Number(left.isActive);
            }
            return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
          });

        setDevices(devices);
        setAllAlerts(normalizedAlerts);
        setSelectedAlert((currentAlert) => {
          if (!currentAlert) return null;
          return normalizedAlerts.find((alert) => alert.id === currentAlert.id) || null;
        });
        return;
      }

      // ── All-devices fetch ─────────────────────────────────────────────
      const [sosResult, alertsResult, familyResult, devicesResult] = await Promise.allSettled([
        alertsService.getSOSAlerts(),
        alertsService.getAlerts({ limit: 50 }),
        familyService.getFamilyMembers(),
        devicesService.getFamilyDevices({ pairStatus: 'Paired', limit: 100 }),
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

      setDevices(devices);
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

  const deviceOptions = useMemo(() => {
    const optionMap = new Map();
    const alertCounts = new Map();
    const pairedDeviceIds = new Set(devices.map((d) => d.id).filter(Boolean));

    allAlerts.forEach((alert) => {
      if (!alert.deviceId) return;
      // Only include alert-based device options for paired devices
      if (!pairedDeviceIds.has(alert.deviceId)) return;
      alertCounts.set(alert.deviceId, (alertCounts.get(alert.deviceId) || 0) + 1);
      if (!optionMap.has(alert.deviceId)) {
        optionMap.set(alert.deviceId, {
          value: alert.deviceId,
          label: alert.deviceName || `Device ${alert.deviceId}`,
        });
      }
    });

    devices.forEach((device) => {
      if (!device.id) return;
      optionMap.set(device.id, {
        value: device.id,
        label: device.name || `Device ${device.id}`,
      });
    });

    const deviceSpecificOptions = Array.from(optionMap.values())
      .sort((left, right) => left.label.localeCompare(right.label))
      .map((option) => {
        const count = alertCounts.get(option.value) || 0;
        return {
          ...option,
          label: count > 0 ? `${option.label} (${count})` : option.label,
        };
      });

    return [
      { value: 'all', label: `All devices (${allAlerts.length})` },
      ...deviceSpecificOptions,
    ];
  }, [allAlerts, devices]);

  const filteredAlerts = useMemo(() => {
    // When a device is selected, the API already returns only that device's alerts
    return allAlerts;
  }, [allAlerts]);

  // Re-fetch alerts when device filter changes
  useEffect(() => {
    fetchAlerts(false, selectedDeviceId);
  }, [selectedDeviceId, fetchAlerts]);

  const activeAlert = useMemo(() => (
    filteredAlerts.find((alert) => alert.type === 'sos' && alert.isActive) ||
    filteredAlerts.find((alert) => alert.isActive) ||
    null
  ), [filteredAlerts]);

  useEffect(() => {
    if (selectedDeviceId === 'all') return;
    const hasSelectedDevice = deviceOptions.some((option) => option.value === selectedDeviceId);
    if (!hasSelectedDevice) {
      setSelectedDeviceId('all');
    }
  }, [deviceOptions, selectedDeviceId]);

  useEffect(() => {
    if (!selectedAlert) return;
    const isStillVisible = filteredAlerts.some((alert) => alert.id === selectedAlert.id);
    if (!isStillVisible) {
      setSelectedAlert(null);
    }
  }, [filteredAlerts, selectedAlert]);

  // ─── Centralized Realtime Subscriptions ─────────────────────────────────────

  // Listen for connection status changes from the centralized service
  useEffect(() => {
    const unsub = onStatusChange((status) => {
      // Map centralized status to UI-specific labels
      if (status === 'live' || status === 'connecting') {
        setRealtimeStatus(status);
      } else {
        setRealtimeStatus('polling');
      }
    });
    return unsub;
  }, []);

  // Subscribe to Alerts table changes via the centralized channel
  useAlertsSubscription(() => {
    fetchAlerts(true);
  }, [fetchAlerts]);

  const dashboardStats = useMemo(() => buildDashboardStats(filteredAlerts), [filteredAlerts]);

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

  return {
    activeAlert,
    allAlerts: filteredAlerts,
    deviceOptions,
    selectedDeviceId,
    setSelectedDeviceId,
    selectedAlert,
    setSelectedAlert,
    loading,
    toast,
    setToast,
    pendingAction,
    realtimeStatus,
    dashboardStats,
    handleCall,
    handleCopySummary,
    handleOpenMap,
    handleResolve,
    handleDismiss,
  };
}
