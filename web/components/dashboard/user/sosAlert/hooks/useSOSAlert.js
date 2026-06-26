import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { alertsService } from '../../../../../services/alertsService';
import { supabase } from '../../../../../services/supabaseClient';
import { devicesService } from '../../../../../services/devicesService';
import { familyService } from '../../../../../services/familyService';
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

  // Real-time subscription: refresh on every INSERT / UPDATE on Alerts
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

  return {
    activeAlert,
    allAlerts,
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
