/**
 * GeofenceFormModal
 * Modal for creating or editing a geofence zone.
 */

import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import styles from './Geofencing.module.css';

const DAYS_OPTIONS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

const INITIAL_FORM = {
  name: '',
  type: 'safe_zone',
  address: '',
  latitude: '',
  longitude: '',
  radius: 250,
  notifyOnEntry: true,
  notifyOnExit: true,
  assignedUserIds: '',
  scheduleEnabled: false,
  scheduleDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  scheduleStartTime: '08:00',
  scheduleEndTime: '15:00',
};

export default function GeofenceFormModal({ isOpen, onClose, onSave, onDelete, editZone }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const isEditing = !!editZone;

  useEffect(() => {
    if (editZone) {
      setForm({
        name: editZone.name || '',
        type: editZone.type || 'safe_zone',
        address: editZone.address || '',
        latitude: editZone.center?.latitude ?? '',
        longitude: editZone.center?.longitude ?? '',
        radius: editZone.radius || 250,
        notifyOnEntry: editZone.notifyOnEntry ?? true,
        notifyOnExit: editZone.notifyOnExit ?? true,
        assignedUserIds: (editZone.assignedUserIds || []).join(', '),
        scheduleEnabled: editZone.schedule?.enabled ?? false,
        scheduleDays: editZone.schedule?.days || ['mon', 'tue', 'wed', 'thu', 'fri'],
        scheduleStartTime: editZone.schedule?.startTime || '08:00',
        scheduleEndTime: editZone.schedule?.endTime || '15:00',
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editZone, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.latitude || !form.longitude) return;

    setSaving(true);
    try {
      const assignedUserIds = form.assignedUserIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => !isNaN(n));

      const payload = {
        name: form.name.trim(),
        type: form.type,
        address: form.address.trim(),
        center: {
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
        },
        radius: form.radius,
        notifyOnEntry: form.notifyOnEntry,
        notifyOnExit: form.notifyOnExit,
        ...(assignedUserIds.length > 0 && { assignedUserIds }),
        schedule: {
          enabled: form.scheduleEnabled,
          days: form.scheduleDays,
          startTime: form.scheduleStartTime,
          endTime: form.scheduleEndTime,
        },
      };
      await onSave(payload, editZone?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editZone?.id) return;
    setSaving(true);
    try {
      await onDelete(editZone.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditing ? 'Edit Geofence' : 'New Geofence'}
          </h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Zone Name</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g., Home, School, Office"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Zone Type</label>
                <select
                  className={styles.formSelect}
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="safe_zone">Safe Zone</option>
                  <option value="danger_zone">Danger Zone</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Radius</label>
                <div className={styles.radiusFormGroup}>
                  <input
                    type="range"
                    className={styles.radiusFormSlider}
                    min={50}
                    max={2000}
                    step={50}
                    value={form.radius}
                    onChange={(e) => handleChange('radius', Number(e.target.value))}
                  />
                  <span className={styles.radiusFormValue}>{form.radius}m</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Address</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="28 Odenike, Street Abule Ijesha"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  className={styles.formInput}
                  placeholder="6.5244"
                  value={form.latitude}
                  onChange={(e) => handleChange('latitude', e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  className={styles.formInput}
                  placeholder="3.3792"
                  value={form.longitude}
                  onChange={(e) => handleChange('longitude', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notifications</label>
              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  id="notifyEntry"
                  checked={form.notifyOnEntry}
                  onChange={(e) => handleChange('notifyOnEntry', e.target.checked)}
                />
                <label className={styles.checkboxLabel} htmlFor="notifyEntry">
                  Notify on entry
                </label>
              </div>
              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  id="notifyExit"
                  checked={form.notifyOnExit}
                  onChange={(e) => handleChange('notifyOnExit', e.target.checked)}
                />
                <label className={styles.checkboxLabel} htmlFor="notifyExit">
                  Notify on exit
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assigned User IDs</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g., 22, 35, 41"
                value={form.assignedUserIds}
                onChange={(e) => handleChange('assignedUserIds', e.target.value)}
              />
              <span className={styles.formHint}>Comma-separated user IDs</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Schedule</label>
              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  id="scheduleEnabled"
                  checked={form.scheduleEnabled}
                  onChange={(e) => handleChange('scheduleEnabled', e.target.checked)}
                />
                <label className={styles.checkboxLabel} htmlFor="scheduleEnabled">
                  Enable schedule
                </label>
              </div>

              {form.scheduleEnabled && (
                <>
                  <div className={styles.daysRow}>
                    {DAYS_OPTIONS.map((day) => {
                      const isSelected = form.scheduleDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          className={`${styles.dayChip} ${isSelected ? styles.dayChipActive : ''}`}
                          onClick={() => {
                            const next = isSelected
                              ? form.scheduleDays.filter((d) => d !== day.value)
                              : [...form.scheduleDays, day.value];
                            handleChange('scheduleDays', next);
                          }}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Start Time</label>
                      <input
                        type="time"
                        className={styles.formInput}
                        value={form.scheduleStartTime}
                        onChange={(e) => handleChange('scheduleStartTime', e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>End Time</label>
                      <input
                        type="time"
                        className={styles.formInput}
                        value={form.scheduleEndTime}
                        onChange={(e) => handleChange('scheduleEndTime', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.modalFooter}>
            {isEditing && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDelete}
                disabled={saving}
              >
                Delete
              </button>
            )}
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving || !form.name.trim()}
            >
              {saving ? 'Saving…' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
