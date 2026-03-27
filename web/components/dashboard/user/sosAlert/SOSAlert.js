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

import React, { useState, useEffect, useCallback } from 'react';
import SosIcon from '@mui/icons-material/Sos';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { alertsService } from '../../../../services/alertsService';
import SOSAlertBanner from './SOSAlertBanner';
import SOSAlertMap from './SOSAlertMap';
import SOSAlertHistory from './SOSAlertHistory';
import Toast from '../../../common/Toast';
import styles from './SOSAlert.module.css';

export default function SOSAlert() {
  const [activeAlert, setActiveAlert] = useState(null);
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // ── Fetch alerts ────────────────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const [sosData, allData] = await Promise.all([
        alertsService.getSOSAlerts().catch(() => ({ alerts: [] })),
        alertsService.getAlerts({ limit: 50 }).catch(() => ({ alerts: [] })),
      ]);

      // Find the first active SOS alert
      const sosAlerts = sosData.alerts || [];
      const active = sosAlerts.find((a) => a.status === 'active') || null;
      setActiveAlert(active);

      setAllAlerts(allData.alerts || []);
    } catch (err) {
      console.error('[SOSAlert] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCall = () => {
    if (activeAlert?.phone) {
      window.open(`tel:${activeAlert.phone}`, '_self');
    } else {
      setToast({ type: 'info', message: 'No phone number available for this user.' });
    }
  };

  const handleShare = async () => {
    const text = `SOS Alert: ${activeAlert?.userName || 'User'} triggered an emergency alert. Location: ${activeAlert?.location?.address || 'Unknown'}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SOS Alert - Sentinelr', text });
      } catch {
        // user cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setToast({ type: 'success', message: 'Tracking info copied to clipboard.' });
      } catch {
        setToast({ type: 'error', message: 'Unable to share tracking link.' });
      }
    }
  };

  const handleResolve = async () => {
    if (!activeAlert) return;
    try {
      await alertsService.resolveAlert(activeAlert.id, { resolution: 'Resolved by user' });
      setToast({ type: 'success', message: 'Alert marked as resolved.' });
      fetchAlerts();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to resolve alert.' });
    }
  };

  const handleDismiss = async () => {
    if (!activeAlert) return;
    try {
      await alertsService.dismissAlert(activeAlert.id);
      setToast({ type: 'success', message: 'Alert dismissed.' });
      fetchAlerts();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to dismiss alert.' });
    }
  };

  return (
    <div className={styles.container}>
    

      {/* Active Alert Section */}
      {activeAlert ? (
        <div className={styles.topSection}>
          <SOSAlertBanner
            alert={activeAlert}
            onCall={handleCall}
            onShare={handleShare}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
          />
          <SOSAlertMap alert={activeAlert} />
        </div>
      ) : (
        <div className={styles.topSection} style={{ gridTemplateColumns: '1fr' }}>
          <div className={styles.noAlertCard}>
            <div className={styles.noAlertIcon}>
              <CheckCircleOutlineIcon />
            </div>
            <h3 className={styles.noAlertTitle}>No Active SOS Alerts</h3>
            <p className={styles.noAlertDesc}>
              All clear! There are no emergency SOS alerts at this time.
              You'll be notified immediately when one is triggered.
            </p>
          </div>
        </div>
      )}

      {/* Recent Alert History */}
      <SOSAlertHistory alerts={allAlerts} loading={loading} />

      {/* Toast notifications */}
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
