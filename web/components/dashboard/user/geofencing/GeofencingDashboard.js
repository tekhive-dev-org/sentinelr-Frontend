/**
 * GeofencingDashboard
 * Main container for the Geofencing dashboard page.
 *
 * Layout (desktop):
 *  ┌──────────────────┬───────────────────────────────────────┐
 *  │  Active Zones     │                                       │
 *  │  ┌──────────────┐ │          Google Map                   │
 *  │  │ Zone Card     │ │     (circles for each zone)          │
 *  │  └──────────────┘ │                     [New Geofence]    │
 *  │  ┌──────────────┐ │                                       │
 *  │  │ Zone Card     │ │                                       │
 *  │  └──────────────┘ │                                       │
 *  │                    │                                       │
 *  │  Recent Activity   │                                       │
 *  │  • User Entered …  │                                       │
 *  │  • User Left …     │                                       │
 *  └──────────────────┴───────────────────────────────────────┘
 */

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import FenceIcon from '@mui/icons-material/Fence';
import { geofencingService } from '../../../../services/geofencingService';
import GeofenceZoneCard from './GeofenceZoneCard';
import GeofenceActivity from './GeofenceActivity';
import GeofenceFormModal from './GeofenceFormModal';
import Toast from '../../../common/Toast';
import styles from './Geofencing.module.css';

// Dynamic import for the map — no SSR
const GeofenceMap = dynamic(() => import('./GeofenceMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
        background: '#eef2f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontSize: '13px',
      }}
    >
      Loading map…
    </div>
  ),
});

export default function GeofencingDashboard() {
  const [geofences, setGeofences] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editZone, setEditZone] = useState(null);

  // ── Fetch geofences & events ────────────────────────────────────────────────
  const fetchGeofences = useCallback(async () => {
    try {
      setLoading(true);
      const data = await geofencingService.getGeofences().catch(() => ({ geofences: [] }));
      const zones = data.geofences || [];
      setGeofences(zones);

      // Fetch events for all active zones
      const allEvents = [];
      for (const zone of zones.filter((z) => z.isActive).slice(0, 5)) {
        try {
          const evData = await geofencingService.getGeofenceEvents(zone.id);
          const zoneEvents = (evData.events || []).map((ev) => ({
            ...ev,
            zoneName: zone.name,
          }));
          allEvents.push(...zoneEvents);
        } catch {
          // skip
        }
      }
      // Sort newest first, keep top 10
      allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setEvents(allEvents.slice(0, 10));
    } catch (err) {
      console.error('[Geofencing] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGeofences();
  }, [fetchGeofences]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleToggle = async (zoneId, isActive) => {
    // Optimistic update
    setGeofences((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, isActive } : z))
    );
    try {
      await geofencingService.toggleGeofence(zoneId, isActive);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to toggle zone.' });
      fetchGeofences();
    }
  };

  const handleRadiusChange = async (zoneId, radius) => {
    setGeofences((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, radius } : z))
    );
    // Debounce: we only save when the user finishes dragging (via onMouseUp on the slider).
    // For now, do an immediate save on change.
    try {
      await geofencingService.updateGeofence(zoneId, { radius });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update radius.' });
    }
  };

  const handleEdit = (zone) => {
    setEditZone(zone);
    setIsModalOpen(true);
  };

  const handleNewGeofence = () => {
    setEditZone(null);
    setIsModalOpen(true);
  };

  const handleSave = async (payload, existingId) => {
    try {
      if (existingId) {
        await geofencingService.updateGeofence(existingId, payload);
        setToast({ type: 'success', message: 'Geofence updated successfully.' });
      } else {
        await geofencingService.createGeofence(payload);
        setToast({ type: 'success', message: 'Geofence created successfully.' });
      }
      fetchGeofences();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save geofence.' });
      throw err; // let the modal handle loading state
    }
  };

  const handleDelete = async (zoneId) => {
    try {
      await geofencingService.deleteGeofence(zoneId);
      setToast({ type: 'success', message: 'Geofence deleted.' });
      fetchGeofences();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete geofence.' });
      throw err;
    }
  };

  const activeCount = geofences.filter((z) => z.isActive).length;

  return (
    <div className={styles.container}>
      <div className={styles.mainLayout}>
        {/* ── Left Panel ─────────────────────────────────────────────────── */}
        <div className={styles.leftPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Active Zones</span>
            <span className={styles.activeCount}>
              <span className={styles.activeCountDot} />
              {activeCount} Active
            </span>
          </div>

          {loading ? (
            <div className={styles.loadingWrapper}>
              <span style={{ color: '#9ca3af', fontSize: 14 }}>Loading zones…</span>
            </div>
          ) : geofences.length === 0 ? (
            <div className={styles.emptyZones}>
              <div className={styles.emptyZonesIcon}>
                <FenceIcon />
              </div>
              <span className={styles.emptyZonesTitle}>No geofences yet</span>
              <span className={styles.emptyZonesDesc}>
                Create your first geofence to start monitoring zone activity.
              </span>
            </div>
          ) : (
            <div className={styles.zoneList}>
              {geofences.map((zone) => (
                <GeofenceZoneCard
                  key={zone.id}
                  zone={zone}
                  onToggle={handleToggle}
                  onRadiusChange={handleRadiusChange}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}

          <GeofenceActivity events={events} onViewAll={() => {}} />
        </div>

        {/* ── Map Section ────────────────────────────────────────────────── */}
        <div className={styles.mapSection}>
          <button className={styles.newGeofenceBtn} onClick={handleNewGeofence}>
            New Geofence
            <AddLocationAltIcon />
          </button>
          <div className={styles.mapWrapper}>
            <GeofenceMap geofences={geofences} selectedZoneId={selectedZoneId} />
          </div>
        </div>
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <GeofenceFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditZone(null); }}
        onSave={handleSave}
        onDelete={handleDelete}
        editZone={editZone}
      />

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
