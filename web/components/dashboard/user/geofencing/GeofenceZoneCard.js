/**
 * GeofenceZoneCard
 * Individual geofence zone card with toggle, radius slider, and edit button.
 */

import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import PlaceIcon from '@mui/icons-material/Place';
import EditIcon from '@mui/icons-material/Edit';
import styles from './Geofencing.module.css';

const ZONE_ICONS = {
  home: HomeIcon,
  school: SchoolIcon,
  work: BusinessIcon,
  office: BusinessIcon,
};

function getZoneIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, Icon] of Object.entries(ZONE_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return PlaceIcon;
}

export default function GeofenceZoneCard({
  zone,
  onToggle,
  onRadiusChange,
  onEdit,
}) {
  const Icon = getZoneIcon(zone.name);
  const isDanger = zone.type === 'danger_zone';
  const iconClass = isDanger ? styles.zoneIconDanger : styles.zoneIconSafe;

  return (
    <div className={styles.zoneCard}>
      <div className={styles.zoneCardHeader}>
        <div className={`${styles.zoneIcon} ${iconClass}`}>
          <Icon />
        </div>
        <div className={styles.zoneInfo}>
          <div className={styles.zoneName}>{zone.name}</div>
          <div className={styles.zoneAddress}>{zone.address || 'No address'}</div>
        </div>
        <button
          className={`${styles.toggleSwitch} ${zone.isActive ? styles.active : ''}`}
          onClick={() => onToggle(zone.id, !zone.isActive)}
          aria-label={`Toggle ${zone.name}`}
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>

      <div className={styles.radiusRow}>
        <span className={styles.radiusLabel}>Radius Settings</span>
        <div className={styles.radiusRight}>
          <input
            type="range"
            className={styles.radiusSlider}
            min={50}
            max={2000}
            step={50}
            value={zone.radius || 250}
            onChange={(e) => onRadiusChange(zone.id, Number(e.target.value))}
          />
          <span className={styles.radiusValue}>{zone.radius || 250}m</span>
          <button
            className={styles.editBtn}
            onClick={() => onEdit(zone)}
            aria-label={`Edit ${zone.name}`}
          >
            <EditIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
